import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject('ADMIN_SERVICE') private adminService: ClientProxy,
  ) {}

  @Get('users')
  async getUsers(@Query('page') page?: string, @Query('search') search?: string) {
    return this.adminService.send('admin.users.list', {
      page: page ? parseInt(page) : 1,
      search,
    });
  }

  @Post('users/:id/ban')
  async banUser(@Param('id') userId: string, @Body() body: { reason: string; adminId: string }) {
    return this.adminService.send('admin.users.ban', {
      userId,
      reason: body.reason,
      adminId: body.adminId,
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Body() body: { adminId: string }) {
    return this.adminService.send('admin.users.delete', {
      userId,
      adminId: body.adminId,
    });
  }

  @Get('rooms')
  async getRooms(@Query('page') page?: string) {
    return this.adminService.send('admin.rooms.list', {
      page: page ? parseInt(page) : 1,
    });
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.send('admin.analytics.overview', {});
  }
}