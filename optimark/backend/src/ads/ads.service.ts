import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const RATES: Record<string, number> = {
  PRODUCT_BOOST: 0.05,
  HOMEPAGE_BANNER: 2.5,
  CATEGORY_SPOTLIGHT: 1.0,
  SEARCH_PRIORITY: 0.08,
};

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async getCampaigns(sellerId: string) {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { sellerId },
      include: { product: { select: { id: true, title: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: campaigns, success: true };
  }

  async createCampaign(sellerId: string, dto: {
    productId?: string;
    type: string;
    budget: number;
    durationDays: number;
  }) {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + (dto.durationDays || 7));

    const campaign = await this.prisma.adCampaign.create({
      data: {
        sellerId,
        productId: dto.productId || null,
        type: dto.type || 'PRODUCT_BOOST',
        budget: dto.budget,
        endsAt,
      },
      include: { product: { select: { id: true, title: true, images: true } } },
    });
    return { data: campaign, message: 'Campagne créée', success: true };
  }

  async toggleCampaign(id: string, sellerId: string) {
    const campaign = await this.prisma.adCampaign.findFirst({ where: { id, sellerId } });
    if (!campaign) throw new NotFoundException('Campagne introuvable');
    const updated = await this.prisma.adCampaign.update({
      where: { id },
      data: { isActive: !campaign.isActive },
    });
    return { data: updated, message: updated.isActive ? 'Campagne activée' : 'Campagne suspendue', success: true };
  }

  async deleteCampaign(id: string, sellerId: string) {
    const campaign = await this.prisma.adCampaign.findFirst({ where: { id, sellerId } });
    if (!campaign) throw new NotFoundException('Campagne introuvable');
    await this.prisma.adCampaign.delete({ where: { id } });
    return { message: 'Campagne supprimée', success: true };
  }

  async getStats(sellerId: string) {
    const campaigns = await this.prisma.adCampaign.findMany({ where: { sellerId } });
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
    const activeCampaigns = campaigns.filter(c => c.isActive && new Date(c.endsAt) > new Date()).length;
    return {
      data: { totalBudget, totalSpent, totalImpressions, totalClicks, ctr: parseFloat(ctr), activeCampaigns, rates: RATES },
      success: true,
    };
  }
}
