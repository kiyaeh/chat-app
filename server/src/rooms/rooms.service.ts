import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto, creatorId: string) {
    const room = await this.prisma.room.create({
      data: {
        ...createRoomDto,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: 'OWNER',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return room;
  }

  async findAll(userId: string) {
    return this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is a member
    const isMember = room.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, userId: string) {
    const room = await this.findOne(id, userId);
    
    // Check if user has permission to update (owner or admin)
    const userMember = room.members.find(member => member.userId === userId);
    if (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role)) {
      throw new ForbiddenException('You do not have permission to update this room');
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });
  }

  async joinRoom(roomId: string, joinRoomDto: JoinRoomDto, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is already a member
    const existingMember = room.members.find(member => member.userId === userId);
    if (existingMember) {
      throw new ForbiddenException('You are already a member of this room');
    }

    // For private rooms, you might want to add invitation logic here
    if (room.isPrivate) {
      throw new ForbiddenException('This room is private');
    }

    return this.prisma.roomMember.create({
      data: {
        userId,
        roomId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    const room = await this.findOne(roomId, userId);
    
    // Check if user is the owner
    const userMember = room.members.find(member => member.userId === userId);
    if (userMember?.role === 'OWNER') {
      throw new ForbiddenException('Room owner cannot leave the room');
    }

    return this.prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const room = await this.findOne(id, userId);
    
    // Only owner can delete room
    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room owner can delete the room');
    }

    return this.prisma.room.delete({
      where: { id },
    });
  }
}