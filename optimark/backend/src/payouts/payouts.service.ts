import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PayoutsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(sellerId: string, dto: { amount: number; bankInfo: any }) {
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException('Montant invalide.');
    const payout = await this.prisma.payoutRequest.create({
      data: { sellerId, amount: dto.amount, bankInfo: dto.bankInfo },
    });
    return { data: payout, message: 'Demande de virement soumise', success: true };
  }

  async getMy(sellerId: string) {
    const payouts = await this.prisma.payoutRequest.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: payouts, success: true };
  }

  async getAll() {
    const payouts = await this.prisma.payoutRequest.findMany({
      include: { seller: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: payouts, success: true };
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Demande introuvable');

    const updated = await this.prisma.payoutRequest.update({
      where: { id },
      data: { status, adminNote },
    });

    const msg = status === 'APPROVED'
      ? `✅ Votre demande de virement de ${payout.amount.toFixed(2)} TND a été approuvée.`
      : status === 'PAID'
      ? `💸 Votre virement de ${payout.amount.toFixed(2)} TND a été effectué !`
      : `❌ Votre demande de virement a été rejetée. ${adminNote || ''}`;

    await this.notifications.create(payout.sellerId, 'SYSTEM', msg);
    return { data: updated, success: true };
  }
}
