import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dtos/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) {
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const services = await this.prisma.service.findMany({
      where,
      include: { seller: { select: { id: true, name: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: services, message: 'Services récupérés', success: true };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, isVerified: true } },
        reviews: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!service) throw new NotFoundException('Service introuvable');
    return { data: service, message: 'Service récupéré', success: true };
  }

  async create(dto: CreateServiceDto, sellerId: string) {
    const service = await this.prisma.service.create({ data: { ...dto, sellerId } });
    return { data: service, message: 'Service créé', success: true };
  }

  async update(id: string, dto: Partial<CreateServiceDto>, userId: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service introuvable');
    if (service.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.service.update({ where: { id }, data: dto });
    return { data: updated, message: 'Service mis à jour', success: true };
  }

  async remove(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service introuvable');
    if (service.sellerId !== userId) throw new ForbiddenException('Accès refusé');

    await this.prisma.service.delete({ where: { id } });
    return { data: null, message: 'Service supprimé', success: true };
  }
}
