import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PLANS = {
  FREE:     { name: 'Gratuit',  price: 0,   maxProducts: 10,  commission: 10, badge: null,    analytics: false },
  PRO:      { name: 'Pro',      price: 29,  maxProducts: 100, commission: 7,  badge: 'PRO',   analytics: true  },
  BUSINESS: { name: 'Business', price: 79,  maxProducts: 999, commission: 5,  badge: 'BUSINESS', analytics: true },
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  getPlans() {
    return { data: PLANS, success: true };
  }

  async getCurrentPlan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionEnd: true },
    });
    const plan = PLANS[user?.subscriptionPlan as keyof typeof PLANS] || PLANS.FREE;
    const productCount = await this.prisma.product.count({ where: { sellerId: userId } });
    return {
      data: {
        plan: user?.subscriptionPlan || 'FREE',
        details: plan,
        subscriptionEnd: user?.subscriptionEnd,
        productCount,
        canAddProduct: productCount < plan.maxProducts,
        remainingSlots: Math.max(0, plan.maxProducts - productCount),
      },
      success: true,
    };
  }

  async upgrade(userId: string, plan: string) {
    if (!PLANS[plan as keyof typeof PLANS]) throw new BadRequestException('Plan invalide.');
    if (plan === 'FREE') throw new BadRequestException('Impossible de revenir au plan gratuit directement.');

    const durationDays = 30;
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: plan, subscriptionEnd },
      select: { subscriptionPlan: true, subscriptionEnd: true },
    });

    return {
      data: user,
      message: `Abonnement ${PLANS[plan as keyof typeof PLANS].name} activé pour 30 jours.`,
      success: true,
    };
  }

  async checkLimit(userId: string) {
    const info = await this.getCurrentPlan(userId);
    if (!info.data.canAddProduct) {
      throw new BadRequestException(
        `Limite atteinte (${info.data.details.maxProducts} produits max sur le plan ${info.data.plan}). Passez à un plan supérieur.`
      );
    }
  }
}
