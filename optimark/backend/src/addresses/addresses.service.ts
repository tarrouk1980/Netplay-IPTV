import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    const addresses = await this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { data: addresses, success: true };
  }

  async create(userId: string, dto: { label: string; street: string; city: string; zip?: string; phone?: string; isDefault?: boolean }) {
    if (dto.isDefault) {
      await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const address = await this.prisma.savedAddress.create({ data: { userId, ...dto } });
    return { data: address, success: true };
  }

  async update(id: string, userId: string, dto: Partial<{ label: string; street: string; city: string; zip: string; phone: string; isDefault: boolean }>) {
    const addr = await this.prisma.savedAddress.findUnique({ where: { id } });
    if (!addr) throw new NotFoundException('Adresse introuvable');
    if (addr.userId !== userId) throw new ForbiddenException('Accès refusé');
    if (dto.isDefault) {
      await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const updated = await this.prisma.savedAddress.update({ where: { id }, data: dto });
    return { data: updated, success: true };
  }

  async delete(id: string, userId: string) {
    const addr = await this.prisma.savedAddress.findUnique({ where: { id } });
    if (!addr) throw new NotFoundException('Adresse introuvable');
    if (addr.userId !== userId) throw new ForbiddenException('Accès refusé');
    await this.prisma.savedAddress.delete({ where: { id } });
    return { success: true };
  }
}
