import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.create')
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    return this.notificationService.createNotification(data);
  }

  @MessagePattern('notification.send.email')
  async sendEmail(data: {
    to: string;
    subject: string;
    content: string;
  }) {
    return this.notificationService.sendEmail(data);
  }

  @MessagePattern('notification.send.push')
  async sendPush(data: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }) {
    return this.notificationService.sendPush(data);
  }

  @MessagePattern('notification.get.user')
  async getUserNotifications(data: { userId: string; page?: number }) {
    return this.notificationService.getUserNotifications(data.userId, data.page);
  }

  @MessagePattern('notification.mark.read')
  async markAsRead(data: { notificationId: string }) {
    return this.notificationService.markAsRead(data.notificationId);
  }
}