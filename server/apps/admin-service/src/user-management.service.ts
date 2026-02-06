import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page = 1, search?: string) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          createdAt: true,
          lastSeen: true,
          _count: {
            select: {
              sentMessages: true,
              roomMemberships: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async banUser(userId: string, reason: string, adminId: string) {
    // Log admin action
    console.log(`Admin ${adminId} banned user ${userId} for: ${reason}`);
    
    // Update user status to banned (you might want to add a banned field to User model)
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'OFFLINE' }, // Temporary - should add banned status
    });
  }

  async unbanUser(userId: string, adminId: string) {
    console.log(`Admin ${adminId} unbanned user ${userId}`);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'OFFLINE' },
    });
  }

  async deleteUser(userId: string, adminId: string) {
    console.log(`Admin ${adminId} deleted user ${userId}`);
    
    // This will cascade delete related records due to Prisma schema
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}