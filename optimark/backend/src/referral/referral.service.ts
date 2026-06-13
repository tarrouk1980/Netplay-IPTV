import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const REFERRAL_POINTS = 200; // points awarded to referrer on first order of referred user

@Injectable()
export class ReferralService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private generateCode(name: string): string {
    const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 6);
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${base}${suffix}`;
  }

  async getMyCode(userId: string) {
    let user = await this.prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true, name: true } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (!user.referralCode) {
      let code = this.generateCode(user.name);
      // ensure uniqueness
      while (await this.prisma.user.findUnique({ where: { referralCode: code } })) {
        code = this.generateCode(user.name);
      }
      await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      user = { referralCode: code, name: user.name };
    }

    const referredCount = await this.prisma.user.count({ where: { referredById: userId } });
    return {
      data: {
        code: user.referralCode,
        referredCount,
        pointsPerReferral: REFERRAL_POINTS,
        shareText: `Rejoins OPTIMARK avec mon code ${user.referralCode} et profite d'offres exclusives ! 🛒`,
      },
      success: true,
    };
  }

  async applyReferral(userId: string, code: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId }, select: { referredById: true } });
    if (me?.referredById) throw new BadRequestException('Vous avez déjà utilisé un code de parrainage.');

    const referrer = await this.prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } });
    if (!referrer) throw new BadRequestException('Code de parrainage invalide.');
    if (referrer.id === userId) throw new BadRequestException('Vous ne pouvez pas utiliser votre propre code.');

    await this.prisma.user.update({ where: { id: userId }, data: { referredById: referrer.id } });

    await this.notifications.create(
      referrer.id,
      'SYSTEM',
      `🎉 Quelqu'un a utilisé votre code de parrainage ! Vous gagnerez ${REFERRAL_POINTS} points après leur première commande.`,
    );

    return { data: { applied: true }, message: 'Code de parrainage appliqué !', success: true };
  }

  async onFirstOrder(buyerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: buyerId }, select: { referredById: true } });
    if (!user?.referredById) return;

    // Award points to referrer only once — check by counting their orders
    const orderCount = await this.prisma.order.count({ where: { buyerId } });
    if (orderCount !== 1) return; // only trigger on first order

    await this.prisma.user.update({
      where: { id: user.referredById },
      data: { loyaltyPoints: { increment: REFERRAL_POINTS } },
    });

    await this.notifications.create(
      user.referredById,
      'SYSTEM',
      `🎁 Vous avez gagné ${REFERRAL_POINTS} points de fidélité grâce à votre parrainage !`,
    );
  }
}
