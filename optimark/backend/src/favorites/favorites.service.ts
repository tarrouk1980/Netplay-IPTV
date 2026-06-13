import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorited: true };
  }

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            category: true,
            isActive: true,
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map(f => f.product);
  }

  async isFavorited(userId: string, productId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { favorited: !!fav };
  }
}
