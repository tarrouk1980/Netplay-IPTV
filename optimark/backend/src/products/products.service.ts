import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
    private notifications: NotificationsService,
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

    return { data: updated, message: 'Produit mis à jour', success: true };
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    await this.prisma.product.delete({ where: { id } });
    return { data: null, message: 'Produit supprimé', success: true };
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
}
