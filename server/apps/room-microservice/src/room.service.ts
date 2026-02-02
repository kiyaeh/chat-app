import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

enum RoomType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CHANNEL = 'CHANNEL'
}

enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(data: { name: string; description?: string; type: RoomType; isPrivate: boolean; creatorId: string }) {
    const room = await this.prisma.room.create({
      data: {
        ...data,
        members: {
          create: {
            userId: data.creatorId,
            role: MemberRole.OWNER
          }
        }
      },
      include: {
        creator: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { members: true, messages: true }
        }
      }
    });
    
    return room;
  }

  async findUserRooms(userId: string) {
    const memberships = await this.prisma.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            creator: {
              select: { id: true, username: true, avatar: true }
            },
            _count: {
              select: { members: true, messages: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });
    
    return memberships.map(m => ({
      ...m.room,
      memberRole: m.role,
      joinedAt: m.joinedAt
    }));
  }

  async findRoomById(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: { id: true, username: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true, status: true }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    });
    
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    
    const isMember = room.members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Access denied');
    }
    
    return room;
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true }
    });
    
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    
    const existingMember = room.members.find(m => m.userId === userId);
    if (existingMember) {
      throw new BadRequestException('Already a member');
    }
    
    await this.prisma.roomMember.create({
      data: {
        roomId,
        userId,
        role: MemberRole.MEMBER
      }
    });
    
    return { message: 'Joined room successfully' };
  }

  async leaveRoom(roomId: string, userId: string) {
    const membership = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: { userId, roomId }
      }
    });
    
    if (!membership) {
      throw new NotFoundException('Not a member of this room');
    }
    
    if (membership.role === MemberRole.OWNER) {
      throw new ForbiddenException('Owner cannot leave room');
    }
    
    await this.prisma.roomMember.delete({
      where: {
        userId_roomId: { userId, roomId }
      }
    });
    
    return { message: 'Left room successfully' };
  }
}