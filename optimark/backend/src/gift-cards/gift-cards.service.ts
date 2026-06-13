import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const AMOUNTS = [10, 20, 50, 100, 200];

@Injectable()
export class GiftCardsService {
  constructor(private prisma: PrismaService) {}

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 16 }, (_, i) =>
      i > 0 && i % 4 === 0 ? '-' + chars[Math.floor(Math.random() * chars.length)]
      : chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  async purchase(userId: string, amount: number) {
    if (!AMOUNTS.includes(amount)) throw new BadRequestException(`Montant invalide. Choisissez parmi : ${AMOUNTS.join(', ')} TND`);
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    const card = await this.prisma.giftCard.create({
      data: { code, amount, balance: amount, purchasedBy: userId, expiresAt },
    });
    return { data: card, message: `Carte cadeau de ${amount} TND créée`, success: true };
  }

  async getMy(userId: string) {
    const cards = await this.prisma.giftCard.findMany({
      where: { purchasedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: cards, success: true };
  }

  async validate(code: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new NotFoundException('Code carte cadeau introuvable');
    if (!card.isActive) throw new BadRequestException('Cette carte cadeau a déjà été utilisée');
    if (card.expiresAt && new Date() > card.expiresAt) throw new BadRequestException('Cette carte cadeau a expiré');
    return { data: { id: card.id, balance: card.balance, amount: card.amount }, success: true };
  }

  async redeem(code: string, amount: number) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card || !card.isActive) throw new BadRequestException('Carte cadeau invalide ou épuisée');
    if (card.expiresAt && new Date() > card.expiresAt) throw new BadRequestException('Carte cadeau expirée');
    if (card.balance < amount) throw new BadRequestException(`Solde insuffisant (${card.balance.toFixed(2)} TND disponible)`);

    const newBalance = card.balance - amount;
    await this.prisma.giftCard.update({
      where: { code },
      data: { balance: newBalance, isActive: newBalance > 0 },
    });
    return { data: { applied: amount, remainingBalance: newBalance }, success: true };
  }

  getAmounts() {
    return { data: AMOUNTS, success: true };
  }
}
