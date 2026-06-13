import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, message: string) {
    return this.prisma.notification.create({ data: { userId, type, message } });
  }

  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { data: notifications, unreadCount };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getPrefs(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { notifPrefs: true } });
    const defaults = { orders: true, promos: true, messages: true, system: true, priceAlerts: true };
    return { data: { ...(user?.notifPrefs as object || {}), ...defaults, ...(user?.notifPrefs as object || {}) }, success: true };
  }

  async updatePrefs(userId: string, prefs: Record<string, boolean>) {
    await this.prisma.user.update({ where: { id: userId }, data: { notifPrefs: prefs } });
    return { data: prefs, message: 'Préférences mises à jour', success: true };
  }
}
