import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoomType } from '../shared/types';

@Controller('rooms')
export class RoomController {
  constructor(@Inject('ROOM_SERVICE') private roomClient: ClientProxy) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserRooms(@Req() req) {
    return this.roomClient.send('room.findUserRooms', { userId: req.user.id });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createRoom(@Req() req, @Body() body: { name: string; description?: string; type: RoomType; isPrivate: boolean }) {
    return this.roomClient.send('room.create', { creatorId: req.user.id, ...body });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getRoomById(@Param('id') roomId: string, @Req() req) {
    return this.roomClient.send('room.findById', { roomId, userId: req.user.id });
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinRoom(@Param('id') roomId: string, @Req() req) {
    return this.roomClient.send('room.join', { roomId, userId: req.user.id });
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  leaveRoom(@Param('id') roomId: string, @Req() req) {
    return this.roomClient.send('room.leave', { roomId, userId: req.user.id });
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  getRoomMembers(@Param('id') roomId: string) {
    return this.roomClient.send('user.getRoomMembers', { roomId });
  }
}