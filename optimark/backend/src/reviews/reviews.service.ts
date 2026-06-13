import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dtos/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: string) {
    if (!dto.productId && !dto.serviceId) {
      throw new BadRequestException('productId ou serviceId requis');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        images: (dto as any).images || [],
        userId,
        productId: dto.productId,
        serviceId: dto.serviceId,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    return { data: review, message: 'Avis créé', success: true };
  }

  async getByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: reviews, message: 'Avis récupérés', success: true };
  }

  async getForSeller(sellerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        OR: [
          { product: { sellerId } },
          { service: { sellerId } },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
        service: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: reviews, success: true };
  }

  async sellerReply(reviewId: string, sellerId: string, reply: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { sellerId: true } }, service: { select: { sellerId: true } } },
    });
    if (!review) throw new NotFoundException('Avis introuvable');
    const ownerSellerId = review.product?.sellerId || review.service?.sellerId;
    if (ownerSellerId !== sellerId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: reply, repliedAt: new Date() },
      include: { user: { select: { id: true, name: true } } },
    });
    return { data: updated, message: 'Réponse enregistrée', success: true };
  }

  async getByService(serviceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: reviews, message: 'Avis récupérés', success: true };
  }
}
