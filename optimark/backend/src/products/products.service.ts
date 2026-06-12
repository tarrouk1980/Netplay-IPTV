import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
  ) {}

  async findAll(query: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isVerifiedSeller?: boolean;
    search?: string;
  }) {
    const where: any = { isActive: true };
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
    return { data: product, message: 'Produit créé', success: true };
  }

  async update(id: string, dto: Partial<CreateProductDto>, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.product.update({ where: { id }, data: dto });
    return { data: updated, message: 'Produit mis à jour', success: true };
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    if (product.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    await this.prisma.product.delete({ where: { id } });
    return { data: null, message: 'Produit supprimé', success: true };
  }
}
