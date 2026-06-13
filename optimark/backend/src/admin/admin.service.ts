import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, products, orders, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
    ]);
    const sellers = await this.prisma.user.count({ where: { role: 'SELLER' } });
    const pendingOrders = await this.prisma.order.count({ where: { status: 'PENDING' } });
    return {
      data: {
        totalUsers: users,
        totalSellers: sellers,
        totalProducts: products,
        totalOrders: orders,
        totalRevenue: revenue._sum.total || 0,
        pendingOrders,
      },
      success: true,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true, phone: true },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, total, page, limit, success: true };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });
    return { data: user, success: true };
  }

  async toggleUserVerified(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: !user!.isVerified },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });
    return { data: updated, success: true };
  }

  async getOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, title: true, sellerId: true } } } },
        },
      }),
      this.prisma.order.count(),
    ]);
    return { data: orders, total, page, limit, success: true };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
    return { data: order, success: true };
  }

  async getProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count(),
    ]);
    return { data: products, total, page, limit, success: true };
  }

  async toggleProductActive(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive: !product!.isActive },
    });
    return { data: updated, success: true };
  }

  async getInvoice(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: {
                id: true, title: true, price: true,
                seller: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    return { data: order, success: true };
  }

  async getCommissionsReport() {
    const sellers = await this.prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true, name: true, email: true, subscriptionPlan: true, isVerified: true,
        products: { select: { id: true } },
      },
    });

    const report = await Promise.all(sellers.map(async seller => {
      const orders = await this.prisma.order.findMany({
        where: { status: { not: 'CANCELLED' }, items: { some: { product: { sellerId: seller.id } } } },
        include: { items: { include: { product: { select: { sellerId: true } } } } },
      });
      const revenue = orders.reduce((sum, o) => {
        const sellerItems = o.items.filter(i => i.product.sellerId === seller.id);
        return sum + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      }, 0);
      const plan = seller.subscriptionPlan || 'FREE';
      const commissionRate = plan === 'PRO' ? 7 : plan === 'BUSINESS' ? 5 : 10;
      const commission = revenue * commissionRate / 100;
      return {
        id: seller.id, name: seller.name, email: seller.email,
        plan, commissionRate, productCount: seller.products.length,
        revenue: parseFloat(revenue.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        isVerified: seller.isVerified,
      };
    }));

    return { data: report.sort((a, b) => b.revenue - a.revenue), success: true };
  }

  async getRevenueChart(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const map: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      map[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (map[key] !== undefined) map[key] = +(map[key] + Number(o.total)).toFixed(2);
    }
    const data = Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
    return { data, success: true };
  }

  async getReviews(limit = 50) {
    const reviews = await this.prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true } },
      },
    });
    return { data: reviews, success: true };
  }

  async deleteReview(id: string) {
    await this.prisma.review.delete({ where: { id } });
    return { data: null, message: 'Avis supprimé', success: true };
  }

  async getReturns(limit = 50) {
    const returns = await this.prisma.returnRequest.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, total: true } },
      },
    });
    return { data: returns, success: true };
  }

  async getSearchAnalytics() {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalSearches, totalSearches7d, topQueries, zeroResultQueries] = await Promise.all([
      this.prisma.searchLog.count(),
      this.prisma.searchLog.count({ where: { createdAt: { gte: since7d } } }),
      (this.prisma.searchLog as any).groupBy({
        by: ['query'],
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 20,
        where: { results: { gt: 0 }, createdAt: { gte: since30d } },
      }),
      (this.prisma.searchLog as any).groupBy({
        by: ['query'],
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 20,
        where: { results: 0, createdAt: { gte: since30d } },
      }),
    ]);
    return {
      data: {
        totalSearches,
        totalSearches7d,
        topQueries: topQueries.map((g: any) => ({ query: g.query, count: g._count.query })),
        zeroResultQueries: zeroResultQueries.map((g: any) => ({ query: g.query, count: g._count.query })),
      },
      success: true,
    };
  }

  async getPlatformHealth() {
    const [
      totalProducts, activeProducts, totalOrders, pendingOrders,
      totalUsers, sellersCount, totalReviews, avgRating,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'SELLER' } }),
      this.prisma.review.count(),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
    ]);
    return {
      data: {
        products: { total: totalProducts, active: activeProducts, inactive: totalProducts - activeProducts },
        orders: { total: totalOrders, pending: pendingOrders },
        users: { total: totalUsers, sellers: sellersCount, buyers: totalUsers - sellersCount },
        reviews: { total: totalReviews, avgRating: parseFloat((avgRating._avg.rating || 0).toFixed(2)) },
      },
      success: true,
    };
  }
}
