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

  async getFollowStatus(followerId: string | undefined, sellerId: string) {
    if (!followerId) return { data: { following: false, followerCount: await this.prisma.sellerFollow.count({ where: { sellerId } }) }, success: true };
    const [follow, count] = await Promise.all([
      this.prisma.sellerFollow.findUnique({ where: { followerId_sellerId: { followerId, sellerId } } }),
      this.prisma.sellerFollow.count({ where: { sellerId } }),
    ]);
    return { data: { following: !!follow, followerCount: count }, success: true };
  }
}
