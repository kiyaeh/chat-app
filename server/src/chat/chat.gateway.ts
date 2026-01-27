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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

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

  constructor(private usersService: UsersService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user from JWT token
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT and get user (simplified - in production, use proper JWT verification)
      const userId = client.handshake.auth.userId;
      if (userId) {
        this.connectedUsers.set(client.id, userId);
        await this.usersService.updateOnlineStatus(userId, true);
        
        // Notify others that user is online
        client.broadcast.emit('userOnline', { userId });
        
        console.log(`User ${userId} connected`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      await this.usersService.updateOnlineStatus(userId, false);
      
      // Notify others that user is offline
      client.broadcast.emit('userOffline', { userId });
      
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    client.to(data.roomId).emit('userJoinedRoom', {
      userId: this.connectedUsers.get(client.id),
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    client.to(data.roomId).emit('userLeftRoom', {
      userId: this.connectedUsers.get(client.id),
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    // Broadcast message to room members
    this.server.to(data.roomId).emit('newMessage', {
      id: Date.now().toString(), // In production, use proper ID generation
      content: data.content,
      type: data.type || 'TEXT',
      senderId: userId,
      roomId: data.roomId,
      createdAt: new Date(),
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(data.roomId).emit('userTyping', {
      userId,
      roomId: data.roomId,
      isTyping: data.isTyping,
    });
  }
}