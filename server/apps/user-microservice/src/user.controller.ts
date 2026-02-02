import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';

enum UserStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY', 
  OFFLINE = 'OFFLINE'
}

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.findById')
  async findById(data: { id: string }) {
    return this.userService.findById(data.id);
  }

  @MessagePattern('user.updateProfile')
  async updateProfile(data: { id: string; username?: string; avatar?: string }) {
    return this.userService.updateProfile(data.id, { username: data.username, avatar: data.avatar });
  }

  @MessagePattern('user.updateStatus')
  async updateStatus(data: { id: string; status: UserStatus }) {
    return this.userService.updateStatus(data.id, data.status);
  }

  @MessagePattern('user.search')
  async searchUsers(data: { query: string; currentUserId: string }) {
    return this.userService.searchUsers(data.query, data.currentUserId);
  }

  @MessagePattern('user.getRoomMembers')
  async getRoomMembers(data: { roomId: string }) {
    return this.userService.getUsersInRoom(data.roomId);
  }
}