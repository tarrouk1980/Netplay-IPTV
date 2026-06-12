import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getForSeller(sellerId: string) {
    const questions = await this.prisma.productQuestion.findMany({
      where: { product: { sellerId } },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: [{ answer: 'asc' }, { createdAt: 'desc' }],
    });
    return { data: questions, success: true };
  }

  async getByProduct(productId: string) {
    const questions = await this.prisma.productQuestion.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: questions, success: true };
  }

  async ask(productId: string, userId: string, question: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { id: true, title: true, sellerId: true } });
    if (!product) throw new NotFoundException('Produit introuvable');

    const q = await this.prisma.productQuestion.create({
      data: { productId, userId, question },
      include: { user: { select: { id: true, name: true } } },
    });

    await this.notifications.create(
      product.sellerId,
      'SYSTEM',
      `❓ Nouvelle question sur "${product.title}" : "${question.slice(0, 60)}${question.length > 60 ? '…' : ''}"`,
    );

    return { data: q, message: 'Question posée', success: true };
  }

  async answer(questionId: string, sellerId: string, answer: string) {
    const q = await this.prisma.productQuestion.findUnique({
      where: { id: questionId },
      include: { product: { select: { sellerId: true, title: true } } },
    });
    if (!q) throw new NotFoundException('Question introuvable');
    if (q.product.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.productQuestion.update({
      where: { id: questionId },
      data: { answer, answeredAt: new Date() },
      include: { user: { select: { id: true, name: true } } },
    });

    await this.notifications.create(
      q.userId,
      'SYSTEM',
      `💬 Le vendeur a répondu à votre question sur "${q.product.title}".`,
    );

    return { data: updated, message: 'Réponse enregistrée', success: true };
  }

  async delete(questionId: string, userId: string, role: string) {
    const q = await this.prisma.productQuestion.findUnique({ where: { id: questionId } });
    if (!q) throw new NotFoundException('Question introuvable');
    if (q.userId !== userId && role !== 'ADMIN') throw new ForbiddenException('Accès refusé');
    await this.prisma.productQuestion.delete({ where: { id: questionId } });
    return { data: null, message: 'Question supprimée', success: true };
  }
}
