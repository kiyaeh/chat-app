import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getRooms(page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, username: true } },
          _count: { select: { members: true, messages: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.room.count(),
    ]);

    return {
      rooms,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async deleteRoom(roomId: string, adminId: string) {
    // Log admin action
    console.log(`Admin ${adminId} deleted room ${roomId}`);
    
    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalRooms,
      totalMessages,
      activeUsers,
      recentMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.room.count(),
      this.prisma.message.count(),
      this.prisma.user.count({
        where: {
          status: { in: ['ONLINE', 'AWAY'] },
        },
      }),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalRooms,
        totalMessages,
        activeUsers,
        recentMessages,
      },
      timestamp: new Date().toISOString(),
    };
  }
}