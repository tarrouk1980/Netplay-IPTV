import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const POINTS_PER_TND = 10; // 10 points per TND spent
const POINTS_VALUE = 0.01; // 1 point = 0.01 TND

@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    const points = user?.loyaltyPoints ?? 0;
    return {
      data: {
        points,
        equivalentTND: (points * POINTS_VALUE).toFixed(2),
        earnRate: `${POINTS_PER_TND} points par TND dépensé`,
        redeemRate: `100 points = ${(100 * POINTS_VALUE).toFixed(2)} TND`,
      },
      success: true,
    };
  }

  async awardForOrder(userId: string, orderTotal: number) {
    const points = Math.floor(orderTotal * POINTS_PER_TND);
    if (points <= 0) return;
    await this.prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: points } },
    });
    await this.notifications.create(
      userId,
      'SYSTEM',
      `🏆 Vous avez gagné ${points} points de fidélité pour votre commande livrée !`,
    );
  }

  async redeem(userId: string, pointsToRedeem: number) {
    if (!Number.isInteger(pointsToRedeem) || pointsToRedeem <= 0) {
      throw new BadRequestException('Nombre de points invalide.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    if (!user || user.loyaltyPoints < pointsToRedeem) {
      throw new BadRequestException('Points insuffisants.');
    }
    const discountTND = parseFloat((pointsToRedeem * POINTS_VALUE).toFixed(2));
    await this.prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { decrement: pointsToRedeem } },
    });
    await this.notifications.create(
      userId,
      'SYSTEM',
      `🎁 ${pointsToRedeem} points échangés contre une réduction de ${discountTND} TND.`,
    );
    return {
      data: {
        pointsUsed: pointsToRedeem,
        discountTND,
        remainingPoints: user.loyaltyPoints - pointsToRedeem,
      },
      success: true,
      message: `${pointsToRedeem} points échangés contre ${discountTND} TND de réduction.`,
    };
  }
}
