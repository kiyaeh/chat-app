import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
})
export class RoomModule {}