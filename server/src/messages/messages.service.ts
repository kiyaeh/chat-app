import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, senderId: string) {
    // Verify user is member of the room
    const roomMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: senderId,
          roomId: createMessageDto.roomId,
        },
      },
    });

    if (!roomMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const message = await this.prisma.message.create({
      data: {
        ...createMessageDto,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        replyTo: {
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
      },
    });

    // Update room's updatedAt timestamp
    await this.prisma.room.update({
      where: { id: createMessageDto.roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async findByRoom(roomId: string, userId: string, page = 1, limit = 50) {
    // Verify user is member of the room
    const roomMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!roomMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          replyTo: {
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: { roomId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Show oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        room: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
        replyTo: {
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
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is member of the room
    if (message.room.members.length === 0) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto, userId: string) {
    const message = await this.findOne(id, userId);

    // Only sender can edit their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        ...updateMessageDto,
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        replyTo: {
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
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.findOne(id, userId);

    // Only sender can delete their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }

  async search(roomId: string, query: string, userId: string, page = 1, limit = 20) {
    // Verify user is member of the room
    const roomMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!roomMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          roomId,
          content: {
            contains: query,
            mode: 'insensitive',
          },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: {
          roomId,
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query,
    };
  }
}