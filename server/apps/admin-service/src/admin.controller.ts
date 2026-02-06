import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { UserManagementService } from './user-management.service';
import { ModerationService } from './moderation.service';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userManagementService: UserManagementService,
    private readonly moderationService: ModerationService,
  ) {}

  // User Management
  @MessagePattern('admin.users.list')
  async getUsers(data: { page?: number; search?: string }) {
    return this.userManagementService.getUsers(data.page, data.search);
  }

  @MessagePattern('admin.users.ban')
  async banUser(data: { userId: string; reason: string; adminId: string }) {
    return this.userManagementService.banUser(data.userId, data.reason, data.adminId);
  }

  @MessagePattern('admin.users.unban')
  async unbanUser(data: { userId: string; adminId: string }) {
    return this.userManagementService.unbanUser(data.userId, data.adminId);
  }

  @MessagePattern('admin.users.delete')
  async deleteUser(data: { userId: string; adminId: string }) {
    return this.userManagementService.deleteUser(data.userId, data.adminId);
  }

  // Room Management
  @MessagePattern('admin.rooms.list')
  async getRooms(data: { page?: number }) {
    return this.adminService.getRooms(data.page);
  }

  @MessagePattern('admin.rooms.delete')
  async deleteRoom(data: { roomId: string; adminId: string }) {
    return this.adminService.deleteRoom(data.roomId, data.adminId);
  }

  // Message Moderation
  @MessagePattern('admin.messages.flagged')
  async getFlaggedMessages(data: { page?: number }) {
    return this.moderationService.getFlaggedMessages(data.page);
  }

  @MessagePattern('admin.messages.delete')
  async deleteMessage(data: { messageId: string; adminId: string }) {
    return this.moderationService.deleteMessage(data.messageId, data.adminId);
  }

  // Analytics
  @MessagePattern('admin.analytics.overview')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }
}