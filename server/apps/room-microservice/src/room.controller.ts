import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RoomService } from './room.service';

enum RoomType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CHANNEL = 'CHANNEL'
}

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @MessagePattern('room.create')
  async createRoom(data: { name: string; description?: string; type: RoomType; isPrivate: boolean; creatorId: string }) {
    return this.roomService.createRoom(data);
  }

  @MessagePattern('room.findUserRooms')
  async findUserRooms(data: { userId: string }) {
    return this.roomService.findUserRooms(data.userId);
  }

  @MessagePattern('room.findById')
  async findRoomById(data: { roomId: string; userId: string }) {
    return this.roomService.findRoomById(data.roomId, data.userId);
  }

  @MessagePattern('room.join')
  async joinRoom(data: { roomId: string; userId: string }) {
    return this.roomService.joinRoom(data.roomId, data.userId);
  }

  @MessagePattern('room.leave')
  async leaveRoom(data: { roomId: string; userId: string }) {
    return this.roomService.leaveRoom(data.roomId, data.userId);
  }
}