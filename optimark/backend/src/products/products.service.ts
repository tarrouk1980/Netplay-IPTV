import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PriceAlertsService } from '../price-alerts/price-alerts.service';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
    private notifications: NotificationsService,
    private priceAlerts: PriceAlertsService,
  ) {}

  async findAll(query: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isVerifiedSeller?: boolean;
    search?: string;
    sellerId?: string;
  }) {
    const where: any = { isActive: true };
    if (query.sellerId) where.sellerId = query.sellerId;
    if ((query as any).isBestSeller) where.isBestSeller = true;
    if (query.category) where.category = query.category;
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isVerifiedSeller !== undefined) {
      where.seller = { isVerified: query.isVerifiedSeller === true || query.isVerifiedSeller === ('true' as any) };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: products, message: 'Produits récupérés', success: true };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, isVerified: true } },
        reviews: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return { data: product, message: 'Produit récupéré', success: true };
  }

  async create(dto: CreateProductDto, sellerId: string) {
    await this.subscriptions.checkLimit(sellerId);
    const product = await this.prisma.product.create({
      data: { ...dto, sellerId },
    });

    // Notify followers of new product
    const seller = await this.prisma.user.findUnique({ where: { id: sellerId }, select: { name: true } });
    const followers = await this.prisma.sellerFollow.findMany({ where: { sellerId } });
    for (const follow of followers) {
      await this.notifications.create(
        follow.followerId,
        'PROMO',
        `🆕 ${seller?.name || 'Un vendeur'} vient d\'ajouter un nouveau produit : "${dto.title}".`,
      );
    }

    return { data: product, message: 'Produit créé', success: true };
  }

  async update(id: string, dto: Partial<CreateProductDto>, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.product.update({ where: { id }, data: dto });

    // Notify users who favorited this product when a promo price is set
    if (dto.promoPrice && !product.promoPrice) {
      const favorites = await this.prisma.favorite.findMany({ where: { productId: id } });
      const discount = Math.round((1 - dto.promoPrice / product.price) * 100);
      for (const fav of favorites) {
        await this.notifications.create(
          fav.userId,
          'PROMO',
          `🏷️ Un produit dans vos favoris est en promo ! "${product.title}" est maintenant à -${discount}%.`,
        );
      }
    }

    // Notify price alert subscribers when price drops
    const effectiveOld = product.promoPrice ?? product.price;
    const effectiveNew = dto.promoPrice ?? dto.price ?? effectiveOld;
    if (effectiveNew < effectiveOld) {
      await this.priceAlerts.notifyPriceDrop(id, effectiveNew).catch(() => {});
    }

    return { data: updated, message: 'Produit mis à jour', success: true };
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    await this.prisma.product.delete({ where: { id } });
    return { data: null, message: 'Produit supprimé', success: true };
  }

  async getTrending(limit = 8) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const views = await this.prisma.productView.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since } },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = views.map(v => v.productId);
    if (productIds.length === 0) {
      return this.findAll({});
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
    });

    const sorted = productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    return { data: sorted, success: true };
  }

  async trackView(productId: string, userId?: string) {
    await this.prisma.productView.create({ data: { productId, userId } }).catch(() => {});
    return { success: true };
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length < 2) return { data: [], success: true };
    const results = await this.prisma.product.findMany({
      where: {
        isActive: true,
        title: { contains: q.trim(), mode: 'insensitive' },
      },
      select: { id: true, title: true, category: true, price: true, promoPrice: true, images: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    return { data: results, success: true };
  }

  async bulkCreate(products: CreateProductDto[], sellerId: string) {
    const created = await Promise.all(
      (products || []).map(dto =>
        this.prisma.product.create({ data: { ...dto, sellerId } }).catch(() => null)
      )
    );
    const successful = created.filter(Boolean);
    return { data: successful, message: `${successful.length} produit(s) créé(s)`, success: true };
  }

  async clone(id: string, userId: string) {
    const original = await this.prisma.product.findFirst({ where: { id, sellerId: userId } });
    if (!original) throw new Error('Produit introuvable');
    const { id: _id, createdAt, updatedAt, isBestSeller, isNewArrival, ...rest } = original as any;
    const cloned = await this.prisma.product.create({
      data: { ...rest, title: `${rest.title} (copie)`, isActive: false, sellerId: userId },
    });
    return { data: cloned, message: 'Produit dupliqué (inactif)', success: true };
  }

  async toggleActive(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({ where: { id, sellerId: userId } });
    if (!product) throw new Error('Produit introuvable');
    const updated = await this.prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
    return { data: updated, message: updated.isActive ? 'Produit activé' : 'Produit désactivé', success: true };
  }

  async getSimilar(productId: string, limit = 8) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { category: true, sellerId: true } });
    if (!product) return { data: [], success: true };
    const similar = await this.prisma.product.findMany({
      where: { isActive: true, id: { not: productId }, category: product.category },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return { data: similar, success: true };
  }

  async getAlsoBought(productId: string, limit = 6) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 200,
    });
    const orderIds = [...new Set(orderItems.map((o: any) => o.orderId))];
    if (!orderIds.length) return { data: [], success: true };
    const coItems = await this.prisma.orderItem.findMany({
      where: { orderId: { in: orderIds }, productId: { not: productId } },
      select: { productId: true },
    });
    const counts: Record<string, number> = {};
    for (const item of coItems) counts[item.productId] = (counts[item.productId] || 0) + 1;
    const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
    if (!topIds.length) return { data: [], success: true };
    const products = await this.prisma.product.findMany({
      where: { id: { in: topIds }, isActive: true },
      include: { seller: { select: { id: true, name: true } } },
    });
    return { data: topIds.map(id => products.find(p => p.id === id)).filter(Boolean), success: true };
  }

  async getTrending(limit = 12) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const grouped = await (this.prisma.productView as any).groupBy({
      by: ['productId'],
      _count: { productId: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });
    const ids = grouped.map((g: any) => g.productId);
    if (!ids.length) {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: { seller: { select: { id: true, name: true, isVerified: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return { data: products, success: true };
    }
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
    });
    const sorted = ids.map((id: string) => products.find(p => p.id === id)).filter(Boolean);
    return { data: sorted, success: true };
  }

  async getRecentlyViewed(userId: string, limit = 20) {
    const views = await this.prisma.productView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      distinct: ['productId'],
      take: limit,
      include: {
        product: {
          include: { seller: { select: { id: true, name: true } } },
        },
      },
    });
    const products = views.map(v => v.product).filter(p => p && p.isActive);
    return { data: products, success: true };
  }
}
