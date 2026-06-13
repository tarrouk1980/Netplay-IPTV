import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getVendorAnalytics(vendorId: string, period: '7d' | '30d' | '3m' = '30d') {
    const now = new Date();
    const from = new Date();
    if (period === '7d') from.setDate(now.getDate() - 7);
    else if (period === '30d') from.setDate(now.getDate() - 30);
    else from.setMonth(now.getMonth() - 3);

    const vendorProductIds = (
      await this.prisma.product.findMany({ where: { sellerId: vendorId }, select: { id: true } })
    ).map((p) => p.id);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: from },
        items: { some: { productId: { in: vendorProductIds } } },
      },
      include: { items: { where: { productId: { in: vendorProductIds } } } },
      orderBy: { createdAt: 'asc' },
    });

    const revenueByDay: Record<string, number> = {};
    let totalRevenue = 0;

    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      const orderRevenue = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
      revenueByDay[day] = (revenueByDay[day] || 0) + orderRevenue;
      totalRevenue += orderRevenue;
    }

    const dailyRevenue = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));

    const statusCounts: Record<string, number> = {};
    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }

    const productSales: Record<string, { title: string; count: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { title: item.productId, count: 0 };
        }
        productSales[item.productId].count += item.quantity;
      }
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: Object.keys(productSales) } },
      select: { id: true, title: true },
    });
    for (const p of products) {
      if (productSales[p.id]) productSales[p.id].title = p.title;
    }

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, d]) => ({ id, title: d.title, count: d.count }));

    const reviews = await this.prisma.review.findMany({
      where: { productId: { in: vendorProductIds } },
      select: { rating: true },
    });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    const views = await this.prisma.productView.count({
      where: { productId: { in: vendorProductIds }, createdAt: { gte: from } },
    });

    return {
      data: {
        totalRevenue,
        totalOrders: orders.length,
        avgRating: Math.round(avgRating * 10) / 10,
        productViews: views,
        dailyRevenue,
        ordersByStatus: statusCounts,
        topProducts,
      },
      message: 'Analytics vendeur',
      success: true,
    };
  }

  async getPlatformAnalytics() {
    const [totalOrders, totalProducts, totalUsers, totalSellers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'SELLER' } }),
    ]);

    const allOrders = await this.prisma.order.findMany({ select: { total: true } });
    const gmv = allOrders.reduce((s, o) => s + o.total, 0);

    const catCounts = await this.prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    });

    return {
      data: {
        gmv,
        totalOrders,
        totalProducts,
        totalUsers,
        activeSellers: totalSellers,
        topCategories: catCounts.map((c) => ({ category: c.category, count: c._count.category })),
      },
      message: 'Analytics plateforme',
      success: true,
    };
  }

  async trackProductView(productId: string, userId?: string) {
    await this.prisma.productView.create({
      data: { productId, userId },
    });
    return { data: null, message: 'Vue enregistrée', success: true };
  }
}
