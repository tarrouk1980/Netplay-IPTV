import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(sellerId: string, dto: any) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Ce code existe déjà.');
    const coupon = await this.prisma.coupon.create({
      data: { ...dto, sellerId, code: dto.code.toUpperCase() },
    });
    return { data: coupon, success: true };
  }

  async findBySeller(sellerId: string) {
    const coupons = await this.prisma.coupon.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: coupons, success: true };
  }

  async validateCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code?.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new NotFoundException('Code promo invalide.');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new BadRequestException('Ce code a expiré.');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Ce code a atteint son nombre maximum d\'utilisations.');
    return {
      data: { discountPercent: coupon.type === 'PERCENT' ? coupon.discount : null, coupon },
      success: true,
    };
  }

  async validate(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Code promo invalide.');
    if (!coupon.isActive) throw new BadRequestException('Ce code est désactivé.');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new BadRequestException('Ce code a expiré.');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Ce code a atteint son nombre maximum d\'utilisations.');
    if (coupon.minAmount && amount < coupon.minAmount) throw new BadRequestException(`Commande minimum : ${coupon.minAmount} TND.`);

    const discountAmount = coupon.type === 'PERCENT'
      ? (amount * coupon.discount) / 100
      : coupon.discount;

    return {
      data: {
        coupon,
        discountAmount: Math.min(discountAmount, amount),
        finalAmount: Math.max(0, amount - discountAmount),
      },
      success: true,
    };
  }

  async use(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  async toggle(id: string, sellerId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon || coupon.sellerId !== sellerId) throw new ForbiddenException();
    const updated = await this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
    return { data: updated, success: true };
  }

  async delete(id: string, sellerId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon || coupon.sellerId !== sellerId) throw new ForbiddenException();
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }
}
