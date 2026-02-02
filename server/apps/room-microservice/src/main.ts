import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RoomModule } from './room.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RoomModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  
  await app.listen();
  console.log('🏠 Room Microservice is listening');
}
bootstrap();