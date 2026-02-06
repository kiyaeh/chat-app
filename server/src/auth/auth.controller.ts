import { Controller, Post, Body, UseGuards, Request, Get, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';

const users = new Map();

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (users.has(dto.email)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = {
      id: Date.now().toString(),
      username: dto.username || dto.email,
      email: dto.email,
      password: hashedPassword,
    };
    users.set(dto.email, user);
    
    return { id: user.id, username: user.username, email: user.email };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = users.get(dto.email);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    
    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '15m' }
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '7d' }
    );
    
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(dto.refreshToken);
      const accessToken = this.jwtService.sign(
        { id: decoded.id },
        { expiresIn: '15m' }
      );
      return { accessToken };
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return { user: req.user };
  }
}
