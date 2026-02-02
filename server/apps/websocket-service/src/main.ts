import { NestFactory } from '@nestjs/core';
import { WebSocketModule } from './websocket.module';

async function bootstrap() {
  const app = await NestFactory.create(WebSocketModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  
  await app.listen(3007);
  console.log('🔌 WebSocket Service is listening on port 3007');
}
bootstrap();