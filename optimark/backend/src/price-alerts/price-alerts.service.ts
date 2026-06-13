import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PriceAlertsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async subscribe(userId: string, productId: string, targetPrice?: number) {
    const alert = await this.prisma.priceAlert.upsert({
      where: { userId_productId: { userId, productId } },
      update: { targetPrice: targetPrice ?? null },
      create: { userId, productId, targetPrice: targetPrice ?? null },
    });
    return { data: alert, message: 'Alerte de prix activée', success: true };
  }

  async unsubscribe(userId: string, productId: string) {
    await this.prisma.priceAlert.deleteMany({ where: { userId, productId } });
    return { message: 'Alerte supprimée', success: true };
  }

  async getMyAlerts(userId: string) {
    const alerts = await this.prisma.priceAlert.findMany({
      where: { userId },
      include: { product: { select: { id: true, title: true, price: true, promoPrice: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: alerts, success: true };
  }

  async isSubscribed(userId: string, productId: string) {
    const alert = await this.prisma.priceAlert.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { data: { subscribed: !!alert, targetPrice: alert?.targetPrice ?? null }, success: true };
  }

  async notifyPriceDrop(productId: string, newPrice: number) {
    const alerts = await this.prisma.priceAlert.findMany({
      where: {
        productId,
        OR: [
          { targetPrice: null },
          { targetPrice: { gte: newPrice } },
        ],
      },
      include: { product: { select: { title: true } } },
    });

    for (const alert of alerts) {
      const msg = `📉 Le prix de "${alert.product.title}" a baissé à ${newPrice.toFixed(2)} TND !`;
      await this.notifications.create(alert.userId, 'PRICE_DROP', msg).catch(() => {});
    }
    return alerts.length;
  }
}
