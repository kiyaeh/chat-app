import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}