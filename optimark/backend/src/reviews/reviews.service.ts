import { BadRequestException, Injectable } from '@nestjs/common';
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

  async getByService(serviceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: reviews, message: 'Avis récupérés', success: true };
  }
}
