import { Controller, Post, Body, Inject, UseGuards, Request, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  @Post('register')
  register(@Body() body: { email: string; username: string; password: string }) {
    return this.authClient.send('auth.register', body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authClient.send('auth.login', body);
  }

  @Post('refresh')
  refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authClient.send('auth.refresh', body);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Request() req) {
    return this.authClient.send('auth.logout', { userId: req.user.id });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return { user: req.user };
  }
}