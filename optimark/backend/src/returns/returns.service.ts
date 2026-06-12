import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const POINTS_PER_TND = 1; // 1 point per TND spent

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Commande introuvable.');
    if (order.buyerId !== buyerId) throw new ForbiddenException();
    if (order.status !== 'DELIVERED') throw new BadRequestException('Seules les commandes livrées peuvent faire l\'objet d\'un retour.');

    const existing = await this.prisma.returnRequest.findFirst({ where: { orderId, buyerId } });
    if (existing) throw new BadRequestException('Une demande de retour existe déjà pour cette commande.');

    const request = await this.prisma.returnRequest.create({
      data: { orderId, buyerId, reason },
      include: { order: { select: { id: true, total: true } } },
    });
    return { data: request, success: true, message: 'Demande de retour envoyée.' };
  }

  async findByBuyer(buyerId: string) {
    const requests = await this.prisma.returnRequest.findMany({
      where: { buyerId },
      include: { order: { select: { id: true, total: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: requests, success: true };
  }

  async findAll() {
    const requests = await this.prisma.returnRequest.findMany({
      include: {
        order: { select: { id: true, total: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: requests, success: true };
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!request) throw new NotFoundException();

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status, adminNote, updatedAt: new Date() },
    });

    // If refunded, deduct loyalty points earned from that order
    if (status === 'REFUNDED') {
      const pointsEarned = Math.floor(request.order.total * POINTS_PER_TND);
      await this.prisma.user.update({
        where: { id: request.buyerId },
        data: { loyaltyPoints: { decrement: pointsEarned } },
      });
    }

    return { data: updated, success: true };
  }

  async findBySeller(sellerId: string) {
    const requests = await this.prisma.returnRequest.findMany({
      where: {
        order: {
          items: { some: { product: { sellerId } } },
        },
      },
      include: {
        order: { select: { id: true, total: true, createdAt: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: requests, success: true };
  }

  // ─── Loyalty ───────────────────────────────────────────
  async addLoyaltyPoints(userId: string, orderTotal: number) {
    const points = Math.floor(orderTotal * POINTS_PER_TND);
    if (points <= 0) return;
    await this.prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: points } },
    });
  }

  async getLoyaltyPoints(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });
    return { data: { points: user?.loyaltyPoints || 0, valueInTND: ((user?.loyaltyPoints || 0) / 100).toFixed(2) }, success: true };
  }

  async redeemPoints(userId: string, points: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    if (!user || user.loyaltyPoints < points) throw new BadRequestException('Points insuffisants.');
    if (points < 100) throw new BadRequestException('Minimum 100 points à échanger.');
    await this.prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: { decrement: points } } });
    return { data: { redeemedPoints: points, discountTND: (points / 100).toFixed(2) }, success: true };
  }
}
