import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiveService {
  constructor(private prisma: PrismaService) {}

  async createLiveSession(vendorId: string, title: string, products: string[]) {
    const session = await this.prisma.liveSession.create({
      data: { vendorId, title, products },
      include: { vendor: { select: { id: true, name: true, isVerified: true } } },
    });
    return { data: session, message: 'Session live créée', success: true };
  }

  async endLiveSession(sessionId: string, vendorId: string) {
    const session = await this.prisma.liveSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session introuvable');
    if (session.vendorId !== vendorId) throw new ForbiddenException('Accès refusé');

    const updated = await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: { isActive: false, endedAt: new Date() },
    });
    return { data: updated, message: 'Session terminée', success: true };
  }

  async getLiveSessions() {
    const sessions = await this.prisma.liveSession.findMany({
      where: { isActive: true },
      include: { vendor: { select: { id: true, name: true, isVerified: true } } },
      orderBy: { startedAt: 'desc' },
    });
    return { data: sessions, message: 'Sessions actives', success: true };
  }

  async getLiveSession(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: { vendor: { select: { id: true, name: true, isVerified: true } } },
    });
    if (!session) throw new NotFoundException('Session introuvable');
    return { data: session, message: 'Session live', success: true };
  }

  async getVendorLiveSessions(vendorId: string) {
    const sessions = await this.prisma.liveSession.findMany({
      where: { vendorId },
      orderBy: { startedAt: 'desc' },
    });
    return { data: sessions, message: 'Historique lives', success: true };
  }

  async updateViewerCount(sessionId: string, count: number) {
    await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: { viewerCount: count },
    });
  }
}
