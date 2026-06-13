import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistsService {
  constructor(private prisma: PrismaService) {}

  private include = {
    items: {
      include: {
        product: { select: { id: true, title: true, price: true, promoPrice: true, images: true, seller: { select: { name: true } } } },
      },
    },
  };

  async getAll(userId: string) {
    const wishlists = await this.prisma.wishlist.findMany({ where: { userId }, include: this.include, orderBy: { createdAt: 'desc' } });
    return { data: wishlists, success: true };
  }

  async getPublic(id: string) {
    const wl = await this.prisma.wishlist.findUnique({ where: { id }, include: this.include });
    if (!wl) throw new NotFoundException('Liste introuvable');
    if (!wl.isPublic) throw new ForbiddenException('Cette liste est privée');
    return { data: wl, success: true };
  }

  async create(userId: string, name: string, isPublic = false) {
    const wl = await this.prisma.wishlist.create({ data: { userId, name, isPublic }, include: this.include });
    return { data: wl, message: 'Liste créée', success: true };
  }

  async update(id: string, userId: string, dto: { name?: string; isPublic?: boolean }) {
    const wl = await this.prisma.wishlist.findUnique({ where: { id } });
    if (!wl) throw new NotFoundException('Liste introuvable');
    if (wl.userId !== userId) throw new ForbiddenException('Accès refusé');
    const updated = await this.prisma.wishlist.update({ where: { id }, data: dto, include: this.include });
    return { data: updated, success: true };
  }

  async delete(id: string, userId: string) {
    const wl = await this.prisma.wishlist.findUnique({ where: { id } });
    if (!wl) throw new NotFoundException('Liste introuvable');
    if (wl.userId !== userId) throw new ForbiddenException('Accès refusé');
    await this.prisma.wishlist.delete({ where: { id } });
    return { data: null, message: 'Liste supprimée', success: true };
  }

  async addItem(id: string, userId: string, productId: string) {
    const wl = await this.prisma.wishlist.findUnique({ where: { id } });
    if (!wl) throw new NotFoundException('Liste introuvable');
    if (wl.userId !== userId) throw new ForbiddenException('Accès refusé');

    try {
      const item = await this.prisma.wishlistItem.create({
        data: { wishlistId: id, productId },
        include: { product: { select: { id: true, title: true, price: true, promoPrice: true, images: true } } },
      });
      return { data: item, message: 'Produit ajouté', success: true };
    } catch {
      throw new BadRequestException('Produit déjà dans la liste');
    }
  }

  async removeItem(id: string, userId: string, productId: string) {
    const wl = await this.prisma.wishlist.findUnique({ where: { id } });
    if (!wl || wl.userId !== userId) throw new ForbiddenException('Accès refusé');
    await this.prisma.wishlistItem.deleteMany({ where: { wishlistId: id, productId } });
    return { data: null, message: 'Produit retiré', success: true };
  }
}
