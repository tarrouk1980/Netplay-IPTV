import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReturnsService } from '../returns/returns.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ReferralService } from '../referral/referral.service';
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
    private returns: ReturnsService,
    private loyalty: LoyaltyService,
    private referral: ReferralService,
  ) {}

  async createOrder(dto: CreateOrderDto, buyerId: string) {
    let total = 0;
    const itemsData: { productId: string; quantity: number; price: number }[] = [];
    const products: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Produit ${item.productId} introuvable`);
      const price = product.promoPrice ?? product.price;
      total += price * item.quantity;
      itemsData.push({ productId: item.productId, quantity: item.quantity, price });
      products.push({ ...product, orderedQty: item.quantity });
    }

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        total,
        paymentMethod: dto.paymentMethod as any,
        deliveryAddress: dto.deliveryAddress || undefined,
        couponCode: dto.couponCode,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrement stock and notify seller if low
    for (const product of products) {
      const newStock = Math.max(0, (product.stock ?? 0) - product.orderedQty);
      await this.prisma.product.update({ where: { id: product.id }, data: { stock: newStock } });

      // Notify seller: out of stock
      if (newStock === 0 && product.stock > 0) {
        await this.notifications.create(
          product.sellerId,
          'STOCK',
          `Stock épuisé : "${product.title}" n'est plus disponible.`,
        );
      // Notify seller: low stock (below 5)
      } else if (newStock > 0 && newStock <= 5 && product.stock > 5) {
        await this.notifications.create(
          product.sellerId,
          'STOCK',
          `Stock faible : "${product.title}" — plus que ${newStock} unité(s).`,
        );
      }

      // Notify seller of new order
      await this.notifications.create(
        product.sellerId,
        'ORDER',
        `Nouvelle commande #${order.id.slice(0, 8)} pour "${product.title}" (×${product.orderedQty}).`,
      );
    }

    await this.notifications.create(
      buyerId,
      'ORDER',
      `Votre commande #${order.id.slice(0, 8)} a été passée avec succès (${total.toFixed(2)} TND).`,
    );

    // Award referral points if this is a referred user's first order
    await this.referral.onFirstOrder(buyerId).catch(() => {});

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

  async getInvoice(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: { id: true, title: true, price: true, seller: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    if (!order) throw new Error('Commande introuvable');
    if (order.buyerId !== userId) throw new Error('Accès refusé');
    return { data: order, success: true };
  }

  async cancelByBuyer(id: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.buyerId !== buyerId) throw new ForbiddenException('Accès refusé');
    if (order.status !== 'PENDING') throw new ForbiddenException('Seules les commandes en attente peuvent être annulées.');

    const updated = await this.prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    await this.notifications.create(buyerId, 'ORDER_STATUS', `Votre commande #${id.slice(0, 8)} a été annulée.`);
    return { data: updated, message: 'Commande annulée', success: true };
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

    // Award loyalty points when order is delivered
    if (status === 'DELIVERED') {
      await this.loyalty.awardForOrder(order.buyerId, order.total);
    }

    return { data: updated, message: 'Statut mis à jour', success: true };
  }
}
