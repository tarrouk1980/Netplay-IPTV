import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const INCLUDE = {
  items: {
    include: {
      product: {
        select: { id: true, title: true, price: true, promoPrice: true, images: true, category: true, isActive: true },
      },
    },
  },
  seller: { select: { id: true, name: true, isVerified: true } },
};

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async getBySeller(sellerId: string) {
    const cols = await this.prisma.collection.findMany({
      where: { sellerId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return { data: cols, success: true };
  }

  async getPublicBySeller(sellerId: string) {
    const cols = await this.prisma.collection.findMany({
      where: { sellerId, isPublic: true },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return { data: cols, success: true };
  }

  async findOne(id: string) {
    const col = await this.prisma.collection.findUnique({ where: { id }, include: INCLUDE });
    if (!col) throw new NotFoundException('Collection introuvable');
    return { data: col, success: true };
  }

  async create(sellerId: string, dto: { name: string; description?: string; cover?: string; productIds?: string[] }) {
    const col = await this.prisma.collection.create({
      data: {
        sellerId,
        name: dto.name,
        description: dto.description,
        cover: dto.cover,
        items: dto.productIds?.length ? { create: dto.productIds.map(productId => ({ productId })) } : undefined,
      },
      include: INCLUDE,
    });
    return { data: col, message: 'Collection créée', success: true };
  }

  async update(id: string, sellerId: string, dto: any) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col) throw new NotFoundException('Collection introuvable');
    if (col.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    const updated = await this.prisma.collection.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        cover: dto.cover,
        isPublic: dto.isPublic,
        ...(dto.productIds !== undefined ? {
          items: { deleteMany: {}, create: dto.productIds.map((productId: string) => ({ productId })) },
        } : {}),
      },
      include: INCLUDE,
    });
    return { data: updated, success: true };
  }

  async addProduct(id: string, sellerId: string, productId: string) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col || col.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    await this.prisma.collectionItem.upsert({
      where: { collectionId_productId: { collectionId: id, productId } },
      create: { collectionId: id, productId },
      update: {},
    });
    return { success: true };
  }

  async removeProduct(id: string, sellerId: string, productId: string) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col || col.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    await this.prisma.collectionItem.deleteMany({ where: { collectionId: id, productId } });
    return { success: true };
  }

  async delete(id: string, sellerId: string) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col) throw new NotFoundException('Collection introuvable');
    if (col.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    await this.prisma.collection.delete({ where: { id } });
    return { success: true };
  }
}
