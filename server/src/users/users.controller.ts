import { Controller, Get, Put, Body, Param, Query, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserStatus } from '../shared/types';

@Controller('users')
export class UserController {
  constructor(@Inject('USER_SERVICE') private userClient: ClientProxy) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.userClient.send('user.findById', { id: req.user.id });
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req, @Body() body: { username?: string; avatar?: string }) {
    return this.userClient.send('user.updateProfile', { id: req.user.id, ...body });
  }

  @Put('me/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Req() req, @Body() body: { status: UserStatus }) {
    return this.userClient.send('user.updateStatus', { id: req.user.id, status: body.status });
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchUsers(@Query('q') query: string, @Req() req) {
    return this.userClient.send('user.search', { query, currentUserId: req.user.id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUserById(@Param('id') id: string) {
    return this.userClient.send('user.findById', { id });
  }
}