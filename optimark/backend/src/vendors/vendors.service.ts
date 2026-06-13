import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const [products, orders, reviews] = await Promise.all([
      this.prisma.product.findMany({ where: { sellerId: userId } }),
      this.prisma.order.findMany({
        where: { items: { some: { product: { sellerId: userId } } } },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.review.findMany({ where: { product: { sellerId: userId } } }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOrders = orders.filter((o) => new Date(o.createdAt) >= startOfMonth);
    const monthRevenue = monthOrders.reduce((sum, o) => {
      const sellerItems = o.items.filter((i) => (i.product as any).sellerId === userId);
      return sum + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.stockAlert).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      data: {
        totalProducts: products.length,
        totalOrders: orders.length,
        monthRevenue: parseFloat(monthRevenue.toFixed(2)),
        avgRating: parseFloat(avgRating.toFixed(1)),
        lowStockCount,
        outOfStockCount,
      },
      message: 'Dashboard récupéré',
      success: true,
    };
  }

  async getProducts(userId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: products, message: 'Produits récupérés', success: true };
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { items: { some: { product: { sellerId: userId } } } },
      include: {
        items: { include: { product: { select: { id: true, title: true } } } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: orders, message: 'Commandes récupérées', success: true };
  }

  async updateOrderStatus(orderId: string, status: string, sellerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, items: { some: { product: { sellerId } } } },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
    return { data: updated, message: 'Statut mis à jour', success: true };
  }

  async getStore(sellerId: string) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId },
      include: { seller: { select: { name: true, isVerified: true, createdAt: true } } },
    });
    return { data: store, success: true };
  }

  async upsertStore(sellerId: string, dto: any) {
    const store = await this.prisma.store.upsert({
      where: { sellerId },
      update: { ...dto },
      create: { sellerId, name: dto.name || 'Ma Boutique', ...dto },
    });
    return { data: store, message: 'Boutique mise à jour', success: true };
  }

  async getPublicStore(sellerId: string) {
    const [store, products, services, reviews] = await Promise.all([
      this.prisma.store.findUnique({
        where: { sellerId },
        include: { seller: { select: { id: true, name: true, isVerified: true } } },
      }),
      this.prisma.product.findMany({
        where: { sellerId, isActive: true },
        orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.service.findMany({
        where: { sellerId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.findMany({
        where: { product: { sellerId } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    return { data: { store, products, services, reviews }, success: true };
  }

  async requestVerification(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    const { password, ...rest } = user;
    return { data: rest, message: 'Vérification demandée', success: true };
  }

  async toggleFollow(followerId: string, sellerId: string) {
    const existing = await this.prisma.sellerFollow.findUnique({
      where: { followerId_sellerId: { followerId, sellerId } },
    });
    if (existing) {
      await this.prisma.sellerFollow.delete({ where: { id: existing.id } });
      return { data: { following: false }, message: 'Abonnement annulé', success: true };
    }
    await this.prisma.sellerFollow.create({ data: { followerId, sellerId } });
    return { data: { following: true }, message: 'Abonné avec succès', success: true };
  }

  async getEarnings(userId: string) {
    const COMMISSION: Record<string, number> = { FREE: 0.10, PRO: 0.07, BUSINESS: 0.05 };
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { subscriptionPlan: true } });
    const commissionRate = COMMISSION[user?.subscriptionPlan || 'FREE'] ?? 0.10;

    const orders = await this.prisma.order.findMany({
      where: { items: { some: { product: { sellerId: userId } } } },
      include: { items: { include: { product: { select: { sellerId: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    let totalGross = 0, totalNet = 0, totalCommission = 0;
    const monthly: Record<string, { gross: number; net: number; commission: number }> = {};

    for (const order of orders) {
      const sellerItems = order.items.filter(i => i.product.sellerId === userId);
      const gross = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const commission = gross * commissionRate;
      const net = gross - commission;
      totalGross += gross;
      totalCommission += commission;
      totalNet += net;
      const key = `${new Date(order.createdAt).getFullYear()}-${String(new Date(order.createdAt).getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { gross: 0, net: 0, commission: 0 };
      monthly[key].gross += gross;
      monthly[key].net += net;
      monthly[key].commission += commission;
    }

    const monthlyArray = Object.entries(monthly)
      .map(([month, v]) => ({ month, gross: parseFloat(v.gross.toFixed(2)), net: parseFloat(v.net.toFixed(2)), commission: parseFloat(v.commission.toFixed(2)) }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    return {
      data: {
        subscriptionPlan: user?.subscriptionPlan || 'FREE',
        commissionRate: commissionRate * 100,
        totalGross: parseFloat(totalGross.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        totalNet: parseFloat(totalNet.toFixed(2)),
        monthly: monthlyArray,
      },
      success: true,
    };
  }

  async getAnalytics(sellerId: string) {
    const [orders, products, reviews, views] = await Promise.all([
      this.prisma.order.findMany({
        where: { items: { some: { product: { sellerId } } } },
        include: { items: { include: { product: { select: { sellerId: true, title: true, category: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.findMany({ where: { sellerId }, select: { id: true, title: true, stock: true, category: true } }),
      this.prisma.review.findMany({ where: { product: { sellerId } }, select: { rating: true, createdAt: true } }),
      this.prisma.productView.findMany({ where: { product: { sellerId } }, select: { createdAt: true, productId: true } }),
    ]);

    // Top products by revenue
    const productRevenue: Record<string, { title: string; revenue: number; quantity: number }> = {};
    for (const order of orders) {
      for (const item of order.items.filter(i => i.product.sellerId === sellerId)) {
        if (!productRevenue[item.productId]) productRevenue[item.productId] = { title: item.product.title, revenue: 0, quantity: 0 };
        productRevenue[item.productId].revenue += item.price * item.quantity;
        productRevenue[item.productId].quantity += item.quantity;
      }
    }
    const topProducts = Object.entries(productRevenue)
      .map(([id, v]) => ({ id, ...v, revenue: parseFloat(v.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items.filter(i => i.product.sellerId === sellerId)) {
        const cat = item.product.category || 'Autre';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity;
      }
    }
    const byCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue);

    // Weekly order counts (last 8 weeks)
    const weeks: Record<string, number> = {};
    for (const order of orders) {
      const d = new Date(order.createdAt);
      const monday = new Date(d);
      monday.setDate(d.getDate() - d.getDay() + 1);
      const key = monday.toISOString().slice(0, 10);
      weeks[key] = (weeks[key] || 0) + 1;
    }
    const weeklyOrders = Object.entries(weeks)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    // Order status breakdown
    const statusCount: Record<string, number> = {};
    for (const order of orders) { statusCount[order.status] = (statusCount[order.status] || 0) + 1; }

    // View count last 30 days
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const viewsLast30 = views.filter(v => new Date(v.createdAt) >= since30).length;

    // Rating distribution
    const ratingDist = [1, 2, 3, 4, 5].map(r => ({
      rating: r,
      count: reviews.filter(rv => rv.rating === r).length,
    }));

    return {
      data: {
        topProducts,
        byCategory,
        weeklyOrders,
        statusBreakdown: statusCount,
        totalViews: views.length,
        viewsLast30,
        ratingDist,
        totalReviews: reviews.length,
        avgRating: reviews.length ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)) : 0,
      },
      success: true,
    };
  }

  async getFollowStatus(followerId: string | undefined, sellerId: string) {
    if (!followerId) return { data: { following: false, followerCount: await this.prisma.sellerFollow.count({ where: { sellerId } }) }, success: true };
    const [follow, count] = await Promise.all([
      this.prisma.sellerFollow.findUnique({ where: { followerId_sellerId: { followerId, sellerId } } }),
      this.prisma.sellerFollow.count({ where: { sellerId } }),
    ]);
    return { data: { following: !!follow, followerCount: count }, success: true };
  }
}
