import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getPersonalizedProducts(userId: string, limit = 8) {
    const [userOrders, favorites] = await Promise.all([
      this.prisma.order.findMany({
        where: { buyerId: userId },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.favorite.findMany({
        where: { userId },
        include: { product: true },
      }),
    ]);

    const boughtProductIds: string[] = [];
    const categories: string[] = [];
    const prices: number[] = [];

    for (const order of userOrders) {
      for (const item of order.items) {
        boughtProductIds.push(item.productId);
        categories.push(item.product.category);
        prices.push(item.product.price);
      }
    }

    for (const fav of favorites) {
      if (!boughtProductIds.includes(fav.productId)) {
        categories.push(fav.product.category);
        prices.push(fav.product.price);
      }
    }

    if (categories.length === 0) {
      return this.getTrendingProducts(limit);
    }

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const excludeIds = [...new Set([...boughtProductIds, ...favorites.map(f => f.productId)])];
    const uniqueCategories = [...new Set(categories)];

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: excludeIds },
        category: { in: uniqueCategories },
        price: { gte: avgPrice * 0.4, lte: avgPrice * 2.5 },
      },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      take: limit,
      orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
    });

    return { data: products, message: 'Recommandations personnalisées', success: true };
  }

  async getSimilarProducts(productId: string, limit = 8) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { data: [], message: 'Produit introuvable', success: false };

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        category: product.category,
        price: { gte: product.price * 0.7, lte: product.price * 1.3 },
      },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      take: limit,
    });

    return { data: products, message: 'Produits similaires', success: true };
  }

  async getTrendingProducts(limit = 8) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const topItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      where: { order: { createdAt: { gte: sevenDaysAgo } } },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = topItems.map((i) => i.productId);

    if (productIds.length === 0) {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: { seller: { select: { id: true, name: true, isVerified: true } } },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return { data: products, message: 'Produits tendance', success: true };
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
    });

    const ordered = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    return { data: ordered, message: 'Produits tendance', success: true };
  }

  async getRecommendedServices(userId: string, limit = 8) {
    const userOrders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: true } } },
    });

    const categories = userOrders
      .flatMap((o) => o.items.map((i) => i.product.category))
      .filter(Boolean);

    const where: any = { isActive: true };
    if (categories.length > 0) {
      where.category = { in: categories };
    }

    const services = await this.prisma.service.findMany({
      where,
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return { data: services, message: 'Services recommandés', success: true };
  }
}
