import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessageService } from './message.service';

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('message.create')
  async createMessage(data: { content: string; type: MessageType; senderId: string; roomId: string; replyToId?: string }) {
    return this.messageService.createMessage(data);
  }

  @MessagePattern('message.getRoomMessages')
  async getRoomMessages(data: { roomId: string; userId: string; page?: number; limit?: number }) {
    return this.messageService.getRoomMessages(data.roomId, data.userId, data.page, data.limit);
  }

  @MessagePattern('message.update')
  async updateMessage(data: { messageId: string; userId: string; content: string }) {
    return this.messageService.updateMessage(data.messageId, data.userId, data.content);
  }

  @MessagePattern('message.delete')
  async deleteMessage(data: { messageId: string; userId: string }) {
    return this.messageService.deleteMessage(data.messageId, data.userId);
  }
}