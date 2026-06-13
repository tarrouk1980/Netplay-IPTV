import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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

  async getStoreVisits(sellerId: string) {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [total, last30, followers] = await Promise.all([
      this.prisma.productView.count({ where: { product: { sellerId } } }),
      this.prisma.productView.count({ where: { product: { sellerId }, createdAt: { gte: since30 } } }),
      this.prisma.sellerFollow.count({ where: { sellerId } }),
    ]);
    return { data: { totalViews: total, last30Days: last30, followers }, success: true };
  }

  async exportOrdersCsv(sellerId: string): Promise<string> {
    const orders = await this.prisma.order.findMany({
      where: { items: { some: { product: { sellerId } } } },
      include: {
        buyer: { select: { name: true, email: true } },
        items: { include: { product: { select: { title: true, sellerId: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows: string[] = ['ID,Date,Client,Email,Statut,Produits,Total TND'];
    for (const o of orders) {
      const sellerItems = o.items.filter(i => i.product.sellerId === sellerId);
      const products = sellerItems.map(i => `${i.product.title}(x${i.quantity})`).join('; ');
      const total = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      rows.push([
        o.id.slice(0, 8).toUpperCase(),
        new Date(o.createdAt).toLocaleDateString('fr-FR'),
        `"${o.buyer.name}"`,
        o.buyer.email,
        o.status,
        `"${products}"`,
        total.toFixed(2),
      ].join(','));
    }
    return rows.join('\n');
  }

  async getDailyRevenue(sellerId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { not: 'CANCELLED' },
        items: { some: { product: { sellerId } } },
      },
      include: { items: { include: { product: { select: { sellerId: true } } } } },
      orderBy: { createdAt: 'asc' },
    });

    const dayMap: Record<string, number> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      const rev = o.items.filter(i => i.product.sellerId === sellerId).reduce((s, i) => s + i.price * i.quantity, 0);
      dayMap[day] = (dayMap[day] || 0) + rev;
    }

    const result: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      result.push({ date: d, revenue: parseFloat((dayMap[d] || 0).toFixed(2)) });
    }
    return { data: result, success: true };
  }

  async getTopSellers(limit = 20) {
    const stores = await this.prisma.store.findMany({
      include: {
        seller: {
          select: {
            id: true, name: true, isVerified: true,
            _count: { select: { products: true, followers: true } },
          },
        },
      },
      take: limit,
    });

    const sellerIds = stores.map(s => s.sellerId);
    const reviewStats = await this.prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
      _count: { id: true },
      where: { product: { sellerId: { in: sellerIds } } },
    });

    const result = stores.map(store => ({
      id: store.sellerId,
      storeName: store.name,
      description: store.description,
      banner: store.banner,
      logo: store.logo,
      category: store.category,
      isVerified: store.seller.isVerified,
      productCount: store.seller._count.products,
      followerCount: store.seller._count.followers,
    }));

    return { data: result, success: true };
  }

  async exportProductsCsv(sellerId: string): Promise<string> {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    const rows: string[] = ['ID,Titre,Catégorie,Marque,Prix,Prix promo,Stock,Actif,Best Seller,Nouveauté'];
    for (const p of products) {
      rows.push([
        p.id.slice(0, 8).toUpperCase(),
        `"${p.title.replace(/"/g, '""')}"`,
        p.category || '',
        p.brand || '',
        p.price.toFixed(2),
        p.promoPrice != null ? p.promoPrice.toFixed(2) : '',
        String(p.stock),
        p.isActive ? 'Oui' : 'Non',
        p.isBestSeller ? 'Oui' : 'Non',
        p.isNewArrival ? 'Oui' : 'Non',
      ].join(','));
    }
    return rows.join('\n');
  }

  async broadcastToFollowers(sellerId: string, message: string) {
    if (!message?.trim()) throw new BadRequestException('Message requis.');
    if (message.trim().length > 280) throw new BadRequestException('Message trop long (280 caractères max).');
    const seller = await this.prisma.user.findUnique({ where: { id: sellerId }, select: { name: true } });
    const followers = await this.prisma.sellerFollow.findMany({ where: { sellerId }, select: { followerId: true } });
    for (const f of followers) {
      await this.notifications.create(f.followerId, 'PROMO', `📣 ${seller?.name || 'Vendeur'} : ${message.trim()}`);
    }
    return { data: { sent: followers.length }, message: `Message envoyé à ${followers.length} abonné(s)`, success: true };
  }

  async getFollowStatus(followerId: string | undefined, sellerId: string) {
    if (!followerId) return { data: { following: false, followerCount: await this.prisma.sellerFollow.count({ where: { sellerId } }) }, success: true };
    const [follow, count] = await Promise.all([
      this.prisma.sellerFollow.findUnique({ where: { followerId_sellerId: { followerId, sellerId } } }),
      this.prisma.sellerFollow.count({ where: { sellerId } }),
    ]);
    return { data: { following: !!follow, followerCount: count }, success: true };
  }

  async getPerformanceScore(sellerId: string) {
    const [myOrders, allSellerOrders, myProducts, myReviews, myFollowers] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: 'DELIVERED', items: { some: { product: { sellerId } } } },
        include: { items: { include: { product: { select: { sellerId: true } } } } },
      }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.product.count({ where: { sellerId, isActive: true } }),
      this.prisma.review.findMany({ where: { product: { sellerId } } }),
      this.prisma.sellerFollow.count({ where: { sellerId } }),
    ]);

    const myRevenue = myOrders.reduce((sum, o) => {
      return sum + o.items.filter(i => i.product.sellerId === sellerId).reduce((s, i) => s + (i as any).price * (i as any).quantity, 0);
    }, 0);
    const avgRating = myReviews.length ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length : 0;

    // Platform averages
    const totalSellers = await this.prisma.user.count({ where: { role: 'SELLER' } });
    const avgProductsPerSeller = await this.prisma.product.count({ where: { isActive: true } });

    // Simple score: 0-100
    const ratingScore = (avgRating / 5) * 30;
    const reviewScore = Math.min(myReviews.length / 20, 1) * 20;
    const productScore = Math.min(myProducts / 10, 1) * 20;
    const followerScore = Math.min(myFollowers / 50, 1) * 15;
    const revenueScore = Math.min(myRevenue / 5000, 1) * 15;
    const totalScore = Math.round(ratingScore + reviewScore + productScore + followerScore + revenueScore);

    let badge = 'Débutant';
    if (totalScore >= 80) badge = 'Élite ⭐';
    else if (totalScore >= 60) badge = 'Pro 💪';
    else if (totalScore >= 40) badge = 'Confirmé 📈';
    else if (totalScore >= 20) badge = 'En progression 🚀';

    return {
      data: {
        score: totalScore,
        badge,
        stats: {
          deliveredOrders: myOrders.length,
          avgRating: parseFloat(avgRating.toFixed(2)),
          totalReviews: myReviews.length,
          activeProducts: myProducts,
          followers: myFollowers,
          revenue: parseFloat(myRevenue.toFixed(2)),
        },
        breakdown: {
          rating: Math.round(ratingScore),
          reviews: Math.round(reviewScore),
          products: Math.round(productScore),
          followers: Math.round(followerScore),
          revenue: Math.round(revenueScore),
        },
      },
      success: true,
    };
  }
}
