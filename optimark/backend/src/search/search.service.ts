import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DARIJA_MAP: Record<string, string> = {
  bch3hal: 'prix',
  b7al: 'prix',
  zwin: 'bon',
  zwina: 'bon',
  rkhis: 'pas cher',
  rkhisa: 'pas cher',
  ghali: 'cher',
  mzian: 'bon',
  bahi: 'bien',
};

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  private translateDarija(query: string): string {
    let translated = query;
    for (const [darija, french] of Object.entries(DARIJA_MAP)) {
      translated = translated.replace(new RegExp(darija, 'gi'), french);
    }
    return translated;
  }

  async smartSearch(
    query: string,
    filters: {
      type?: 'product' | 'service' | 'all';
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      isVerifiedSeller?: boolean;
    },
  ) {
    const translatedQuery = this.translateDarija(query);
    const { type = 'all', category, minPrice, maxPrice, isVerifiedSeller } = filters;

    const priceFilter: any = {};
    if (minPrice !== undefined) priceFilter.gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.lte = Number(maxPrice);

    const sellerFilter = isVerifiedSeller ? { seller: { isVerified: true } } : {};

    let products: any[] = [];
    let services: any[] = [];

    if (type === 'all' || type === 'product') {
      const where: any = {
        isActive: true,
        OR: [
          { title: { contains: translatedQuery, mode: 'insensitive' } },
          { description: { contains: translatedQuery, mode: 'insensitive' } },
        ],
        ...sellerFilter,
      };
      if (category) where.category = category;
      if (Object.keys(priceFilter).length > 0) where.price = priceFilter;

      const raw = await this.prisma.product.findMany({
        where,
        include: { seller: { select: { id: true, name: true, isVerified: true } } },
        take: 20,
      });

      products = raw.map((p) => ({
        ...p,
        type: 'product',
        score:
          (p.title.toLowerCase().includes(translatedQuery.toLowerCase()) ? 2 : 0) +
          (p.description.toLowerCase().includes(translatedQuery.toLowerCase()) ? 1 : 0),
      }));
    }

    if (type === 'all' || type === 'service') {
      const where: any = {
        isActive: true,
        OR: [
          { title: { contains: translatedQuery, mode: 'insensitive' } },
          { description: { contains: translatedQuery, mode: 'insensitive' } },
        ],
        ...sellerFilter,
      };
      if (category) where.category = category;
      if (Object.keys(priceFilter).length > 0) where.price = priceFilter;

      const raw = await this.prisma.service.findMany({
        where,
        include: { seller: { select: { id: true, name: true, isVerified: true } } },
        take: 20,
      });

      services = raw.map((s) => ({
        ...s,
        type: 'service',
        score:
          (s.title.toLowerCase().includes(translatedQuery.toLowerCase()) ? 2 : 0) +
          (s.description.toLowerCase().includes(translatedQuery.toLowerCase()) ? 1 : 0),
      }));
    }

    const results = [...products, ...services].sort((a, b) => b.score - a.score);
    const total = results.length;

    await this.prisma.searchLog.create({
      data: { query, results: total },
    });

    return {
      data: results,
      total,
      query: translatedQuery,
      originalQuery: query,
      message: total === 0 ? `Aucun résultat pour "${query}"` : `${total} résultat(s)`,
      success: true,
    };
  }
}
