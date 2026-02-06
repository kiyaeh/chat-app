import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async getFlaggedMessages(page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    // Mock flagged messages - in real app, you'd have a flagging system
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, username: true } },
          room: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count(),
    ]);

    return {
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async deleteMessage(messageId: string, adminId: string) {
    console.log(`Admin ${adminId} deleted message ${messageId}`);
    
    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async flagMessage(messageId: string, reason: string, reporterId: string) {
    // In a real app, you'd have a separate flags/reports table
    console.log(`Message ${messageId} flagged by ${reporterId} for: ${reason}`);
    
    return { success: true, messageId, reason };
  }

  async getContentStats() {
    const [
      totalMessages,
      messagesLast24h,
      flaggedMessages,
    ] = await Promise.all([
      this.prisma.message.count(),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Mock flagged count - would be from flags table
      0,
    ]);

    return {
      totalMessages,
      messagesLast24h,
      flaggedMessages,
    };
  }
}