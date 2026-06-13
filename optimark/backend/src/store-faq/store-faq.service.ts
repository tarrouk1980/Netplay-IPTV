import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreFaqService {
  constructor(private prisma: PrismaService) {}

  async getBySeller(sellerId: string) {
    const faqs = await this.prisma.storeFaq.findMany({
      where: { sellerId },
      orderBy: { position: 'asc' },
    });
    return { data: faqs, success: true };
  }

  async getPublic(sellerId: string) {
    const faqs = await this.prisma.storeFaq.findMany({
      where: { sellerId },
      orderBy: { position: 'asc' },
      select: { id: true, question: true, answer: true, position: true },
    });
    return { data: faqs, success: true };
  }

  async create(sellerId: string, dto: { question: string; answer: string }) {
    const count = await this.prisma.storeFaq.count({ where: { sellerId } });
    const faq = await this.prisma.storeFaq.create({
      data: { sellerId, question: dto.question, answer: dto.answer, position: count },
    });
    return { data: faq, message: 'FAQ ajoutée', success: true };
  }

  async update(id: string, sellerId: string, dto: { question?: string; answer?: string; position?: number }) {
    const faq = await this.prisma.storeFaq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ introuvable');
    if (faq.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    const updated = await this.prisma.storeFaq.update({ where: { id }, data: dto });
    return { data: updated, success: true };
  }

  async delete(id: string, sellerId: string) {
    const faq = await this.prisma.storeFaq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ introuvable');
    if (faq.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    await this.prisma.storeFaq.delete({ where: { id } });
    return { data: null, message: 'FAQ supprimée', success: true };
  }
}
