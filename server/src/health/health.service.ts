import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async getHealthStatus() {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: { status: 'ok', responseTime: Date.now() },
        redis: { status: 'ok', responseTime: Date.now() },
      },
    };

    return status;
  }

  async getReadinessStatus() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}