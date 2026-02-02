import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

enum UserStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY', 
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        avatar: true, 
        status: true, 
        lastSeen: true, 
        createdAt: true 
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async updateProfile(id: string, data: { username?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: { id: true, email: true, username: true, avatar: true, status: true },
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status, lastSeen: new Date() },
      select: { id: true, status: true, lastSeen: true },
    });
  }

  async searchUsers(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { id: true, username: true, avatar: true, status: true, lastSeen: true },
      take: 10,
    });
  }

  async getUsersInRoom(roomId: string) {
    const members = await this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, status: true, lastSeen: true }
        }
      }
    });
    
    return members.map(member => ({
      ...member.user,
      role: member.role,
      joinedAt: member.joinedAt
    }));
  }
}