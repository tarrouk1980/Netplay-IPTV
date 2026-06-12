import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  private bundleInclude = {
    items: { include: { product: { select: { id: true, title: true, price: true, promoPrice: true, images: true } } } },
    seller: { select: { id: true, name: true, isVerified: true } },
  };

  async findAll(sellerId?: string) {
    const bundles = await this.prisma.bundle.findMany({
      where: { isActive: true, ...(sellerId ? { sellerId } : {}) },
      include: this.bundleInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { data: bundles.map(b => this.compute(b)), success: true };
  }

  async findOne(id: string) {
    const bundle = await this.prisma.bundle.findUnique({ where: { id }, include: this.bundleInclude });
    if (!bundle) throw new NotFoundException('Bundle introuvable');
    return { data: this.compute(bundle), success: true };
  }

  async create(sellerId: string, dto: { title: string; description?: string; discount: number; productIds: string[] }) {
    const bundle = await this.prisma.bundle.create({
      data: {
        title: dto.title,
        description: dto.description,
        discount: dto.discount,
        sellerId,
        items: { create: dto.productIds.map(productId => ({ productId })) },
      },
      include: this.bundleInclude,
    });
    return { data: this.compute(bundle), message: 'Bundle créé', success: true };
  }

  async update(id: string, sellerId: string, dto: any) {
    const bundle = await this.prisma.bundle.findUnique({ where: { id } });
    if (!bundle) throw new NotFoundException('Bundle introuvable');
    if (bundle.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.bundle.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        discount: dto.discount,
        isActive: dto.isActive,
        ...(dto.productIds ? {
          items: { deleteMany: {}, create: dto.productIds.map((productId: string) => ({ productId })) },
        } : {}),
      },
      include: this.bundleInclude,
    });
    return { data: this.compute(updated), message: 'Bundle mis à jour', success: true };
  }

  async remove(id: string, sellerId: string) {
    const bundle = await this.prisma.bundle.findUnique({ where: { id } });
    if (!bundle) throw new NotFoundException('Bundle introuvable');
    if (bundle.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    await this.prisma.bundle.delete({ where: { id } });
    return { data: null, message: 'Bundle supprimé', success: true };
  }

  private compute(bundle: any) {
    const totalPrice = bundle.items.reduce((sum: number, item: any) => {
      return sum + (item.product.promoPrice ?? item.product.price);
    }, 0);
    const discountedPrice = totalPrice * (1 - bundle.discount / 100);
    return { ...bundle, totalPrice, discountedPrice, savings: totalPrice - discountedPrice };
  }
}
