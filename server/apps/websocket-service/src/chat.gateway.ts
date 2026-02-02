import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private authService: AuthService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.username = user.username;
      this.connectedUsers.set(user.id, client);

      console.log(`User ${user.username} connected`);
      
      // Notify others that user is online
      client.broadcast.emit('userOnline', {
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.username} disconnected`);
      
      // Notify others that user is offline
      client.broadcast.emit('userOffline', {
        userId: client.userId,
        username: client.username,
      });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    client.join(data.roomId);
    client.to(data.roomId).emit('userJoinedRoom', {
      userId: client.userId,
      username: client.username,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    client.leave(data.roomId);
    client.to(data.roomId).emit('userLeftRoom', {
      userId: client.userId,
      username: client.username,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; content: string; messageId: string }
  ) {
    // Broadcast message to all users in the room
    this.server.to(data.roomId).emit('newMessage', {
      id: data.messageId,
      content: data.content,
      roomId: data.roomId,
      sender: {
        id: client.userId,
        username: client.username,
      },
      createdAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean }
  ) {
    client.to(data.roomId).emit('userTyping', {
      userId: client.userId,
      username: client.username,
      roomId: data.roomId,
      isTyping: data.isTyping,
    });
  }

  // Method to send message from API
  sendMessageToRoom(roomId: string, message: any) {
    this.server.to(roomId).emit('newMessage', message);
  }

  // Method to notify user status change
  notifyUserStatusChange(userId: string, status: string) {
    this.server.emit('userStatusChanged', { userId, status });
  }
}