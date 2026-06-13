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

  async getTrendingSearches(limit = 10) {
    const grouped = await (this.prisma.searchLog as any).groupBy({
      by: ['query'],
      _count: { query: true },
      _sum: { results: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        results: { gt: 0 },
      },
    });
    return {
      data: grouped.map((g: any) => ({ query: g.query, count: g._count.query, totalResults: g._sum.results })),
      success: true,
    };
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

  async getSuggestions(query: string, limit = 8) {
    if (!query || query.trim().length < 2) return { data: [], success: true };
    const q = query.trim().toLowerCase();
    const [products, logs] = await Promise.all([
      this.prisma.product.findMany({
        where: { title: { contains: q, mode: 'insensitive' }, isActive: true },
        select: { title: true, category: true },
        take: limit,
        orderBy: { isBestSeller: 'desc' },
      }),
      this.prisma.searchLog.findMany({
        where: { query: { contains: q, mode: 'insensitive' } },
        select: { query: true, results: true },
        orderBy: { results: 'desc' },
        take: 4,
      }),
    ]);
    const titles = [...new Set(products.map(p => p.title))].slice(0, 5);
    const queries = logs.map(l => l.query).filter(q2 => !titles.includes(q2)).slice(0, 3);
    return { data: [...titles, ...queries].slice(0, limit), success: true };
  }
}
