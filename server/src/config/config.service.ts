import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRATION || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      name: process.env.DB_NAME || 'chat_app',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
    file: {
      maxSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
      uploadDir: process.env.UPLOAD_DIR || './uploads',
    },
    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'debug',
    },
  };

  get(key: string): any {
    return this.config[key];
  }

  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}
