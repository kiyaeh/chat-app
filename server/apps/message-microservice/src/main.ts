import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MessageModule } from './message.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(MessageModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  
  await app.listen();
  console.log('💬 Message Microservice is listening');
}
bootstrap();