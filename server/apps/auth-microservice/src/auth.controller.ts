import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(data: { email: string; username: string; password: string }) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.refresh')
  async refreshTokens(data: { refreshToken: string }) {
    return this.authService.refreshTokens(data.refreshToken);
  }

  @MessagePattern('auth.logout')
  async logout(data: { userId: string }) {
    return this.authService.logout(data.userId);
  }

  @MessagePattern('auth.validate')
  async validateToken(data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}