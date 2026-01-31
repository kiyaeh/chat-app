import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      client.userId = user.id;
      client.user = user;
      this.connectedUsers.set(client.id, user.id);

      // Update user online status
      await this.usersService.updateOnlineStatus(user.id, true);

      // Notify others that user is online
      client.broadcast.emit('userOnline', {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      });

      console.log(`User ${user.username} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // Check if user has other connections
      const hasOtherConnections = Array.from(this.connectedUsers.values()).includes(userId);
      
      if (!hasOtherConnections) {
        // Update user offline status
        await this.usersService.updateOnlineStatus(userId, false);
        
        // Notify others that user is offline
        client.broadcast.emit('userOffline', {
          userId,
        });
      }
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const message = await this.messagesService.create(createMessageDto, client.userId);
      
      // Emit to all users in the room
      this.server.to(`room:${createMessageDto.roomId}`).emit('newMessage', message);
      
      return { success: true, message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      client.join(`room:${data.roomId}`);
      
      // Notify others in the room
      client.to(`room:${data.roomId}`).emit('userJoinedRoom', {
        userId: client.userId,
        username: client.user.username,
        roomId: data.roomId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      client.leave(`room:${data.roomId}`);
      
      // Notify others in the room
      client.to(`room:${data.roomId}`).emit('userLeftRoom', {
        userId: client.userId,
        username: client.user.username,
        roomId: data.roomId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(`room:${data.roomId}`).emit('userTyping', {
      userId: client.userId,
      username: client.user.username,
      isTyping: data.isTyping,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(
    @MessageBody() data: { roomId: string; messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(`room:${data.roomId}`).emit('messageRead', {
      userId: client.userId,
      messageId: data.messageId,
      roomId: data.roomId,
    });
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    const userSockets = Array.from(this.connectedUsers.entries())
      .filter(([_, uid]) => uid === userId)
      .map(([socketId]) => socketId);

    userSockets.forEach(socketId => {
      this.server.to(socketId).emit('notification', notification);
    });
  }

  // Method to send message to room
  async sendMessageToRoom(roomId: string, message: any) {
    this.server.to(`room:${roomId}`).emit('newMessage', message);
  }
}