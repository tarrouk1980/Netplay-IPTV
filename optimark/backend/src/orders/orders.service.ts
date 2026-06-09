import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dtos/create-order.dto';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async createOrder(dto: CreateOrderDto, buyerId: string) {
    let total = 0;
    const itemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Produit ${item.productId} introuvable`);
      total += product.price * item.quantity;
      itemsData.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        total,
        paymentMethod: dto.paymentMethod as any,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    await this.notifications.create(
      buyerId,
      'ORDER_PLACED',
      `Votre commande #${order.id.slice(0, 8)} a été passée avec succès (${total.toFixed(2)} TND).`,
    );

    return { data: order, message: 'Commande créée', success: true };
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: { select: { id: true, title: true, images: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: orders, message: 'Commandes récupérées', success: true };
  }

  async getOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.buyerId !== userId) throw new ForbiddenException('Accès refusé');
    return { data: order, message: 'Commande récupérée', success: true };
  }

  async updateStatus(id: string, status: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');

    const updated = await this.prisma.order.update({ where: { id }, data: { status: status as any } });

    await this.notifications.create(
      order.buyerId,
      'ORDER_STATUS',
      `Votre commande #${id.slice(0, 8)} est maintenant : ${STATUS_LABELS[status] || status}.`,
    );

    return { data: updated, message: 'Statut mis à jour', success: true };
  }
}
