import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: { content: string; type: MessageType; senderId: string; roomId: string; replyToId?: string }) {
    // Verify user is member of room
    const membership = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: { userId: data.senderId, roomId: data.roomId }
      }
    });
    
    if (!membership) {
      throw new ForbiddenException('Not a member of this room');
    }
    
    const message = await this.prisma.message.create({
      data,
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });
    
    // TODO: Emit to WebSocket service for real-time delivery
    
    return message;
  }

  async getRoomMessages(roomId: string, userId: string, page = 1, limit = 50) {
    // Verify user is member of room
    const membership = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: { userId, roomId }
      }
    });
    
    if (!membership) {
      throw new ForbiddenException('Not a member of this room');
    }
    
    const messages = await this.prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return messages.reverse(); // Return in chronological order
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    if (message.senderId !== userId) {
      throw new ForbiddenException('Can only edit your own messages');
    }
    
    return this.prisma.message.update({
      where: { id: messageId },
      data: { content, isEdited: true },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    if (message.senderId !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }
    
    await this.prisma.message.delete({
      where: { id: messageId }
    });
    
    return { message: 'Message deleted successfully' };
  }
}