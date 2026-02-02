import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    };

    const isHealthy = Object.values(status.services).every(s => s.status === 'ok');
    status.status = isHealthy ? 'ok' : 'error';

    return status;
  }

  async getReadinessStatus() {
    const dbStatus = await this.checkDatabase();
    return {
      status: dbStatus.status === 'ok' ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', responseTime: Date.now() };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  private async checkRedis() {
    try {
      // Redis check would go here if Redis client was available
      return { status: 'ok', responseTime: Date.now() };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}