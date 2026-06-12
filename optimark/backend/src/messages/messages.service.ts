import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, receiverId: string, content: string, productId?: string) {
    const message = await this.prisma.message.create({
      data: { senderId, receiverId, content, productId },
      include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } },
    });
    return { data: message, success: true };
  }

  async getConversation(userId: string, otherId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // Mark received as read
    await this.prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
    return { data: messages, success: true };
  }

  async getThreads(userId: string) {
    // Get all users this person has exchanged messages with
    const sent = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const otherIds = Array.from(new Set([
      ...sent.map(m => m.receiverId),
      ...received.map(m => m.senderId),
    ]));

    const threads = await Promise.all(otherIds.map(async (otherId) => {
      const last = await this.prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId },
          ],
        },
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      const unread = await this.prisma.message.count({
        where: { senderId: otherId, receiverId: userId, isRead: false },
      });
      const other = await this.prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, name: true, role: true },
      });
      return { other, lastMessage: last, unread };
    }));

    return { data: threads.sort((a, b) =>
      new Date(b.lastMessage!.createdAt).getTime() - new Date(a.lastMessage!.createdAt).getTime()
    ), success: true };
  }
}
