import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlashSalesService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    const now = new Date();
    const sales = await this.prisma.flashSale.findMany({
      where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
      include: {
        product: {
          include: { seller: { select: { id: true, name: true, isVerified: true } } },
        },
      },
      orderBy: { endAt: 'asc' },
    });
    return { data: sales, success: true };
  }

  async getUpcoming() {
    const now = new Date();
    const sales = await this.prisma.flashSale.findMany({
      where: { isActive: true, startAt: { gt: now } },
      include: { product: { select: { id: true, title: true, price: true, images: true } } },
      orderBy: { startAt: 'asc' },
      take: 10,
    });
    return { data: sales, success: true };
  }

  async getBySeller(sellerId: string) {
    const sales = await this.prisma.flashSale.findMany({
      where: { product: { sellerId } },
      include: { product: { select: { id: true, title: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: sales, success: true };
  }

  async create(sellerId: string, dto: { productId: string; discount: number; startAt: string; endAt: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.sellerId !== sellerId) throw new ForbiddenException('Produit introuvable ou accès refusé.');

    const sale = await this.prisma.flashSale.create({
      data: {
        productId: dto.productId,
        discount: dto.discount,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      },
      include: { product: { select: { id: true, title: true, price: true } } },
    });
    return { data: sale, success: true };
  }

  async toggle(id: string, sellerId: string) {
    const sale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!sale || sale.product.sellerId !== sellerId) throw new ForbiddenException();
    const updated = await this.prisma.flashSale.update({
      where: { id },
      data: { isActive: !sale.isActive },
    });
    return { data: updated, success: true };
  }

  async delete(id: string, sellerId: string) {
    const sale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!sale || sale.product.sellerId !== sellerId) throw new ForbiddenException();
    await this.prisma.flashSale.delete({ where: { id } });
    return { success: true };
  }
}
