import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MessageType } from '../shared/types';

@Controller('messages')
export class MessageController {
  constructor(@Inject('MESSAGE_SERVICE') private messageClient: ClientProxy) {}

  @Get(':roomId')
  @UseGuards(JwtAuthGuard)
  getRoomMessages(
    @Param('roomId') roomId: string, 
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.messageClient.send('message.getRoomMessages', { 
      roomId, 
      userId: req.user.id,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createMessage(@Req() req, @Body() body: { roomId: string; content: string; type?: MessageType; replyToId?: string }) {
    return this.messageClient.send('message.create', { 
      senderId: req.user.id, 
      type: body.type || MessageType.TEXT,
      ...body 
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateMessage(@Param('id') messageId: string, @Req() req, @Body() body: { content: string }) {
    return this.messageClient.send('message.update', { 
      messageId, 
      userId: req.user.id, 
      content: body.content 
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteMessage(@Param('id') messageId: string, @Req() req) {
    return this.messageClient.send('message.delete', { 
      messageId, 
      userId: req.user.id 
    });
  }
}