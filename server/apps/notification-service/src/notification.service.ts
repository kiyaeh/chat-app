import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EmailService } from './email.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pushService: PushService,
  ) {}

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        // Remove data field since it doesn't exist in schema
      },
    });

    // Auto-send based on type
    if (data.type === 'EMAIL') {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (user) {
        await this.emailService.sendEmail(user.email, data.title, data.message);
      }
    }

    if (data.type === 'PUSH') {
      await this.pushService.sendPush(data.userId, data.title, data.message, data.data);
    }

    return notification;
  }

  async sendEmail(data: { to: string; subject: string; content: string }) {
    return this.emailService.sendEmail(data.to, data.subject, data.content);
  }

  async sendPush(data: { userId: string; title: string; body: string; data?: any }) {
    return this.pushService.sendPush(data.userId, data.title, data.body, data.data);
  }

  async getUserNotifications(userId: string, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}