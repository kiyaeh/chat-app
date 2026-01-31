import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    console.log('JWT Strategy using secret:', secret.substring(0, 10) + '...');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    try {
      const user = await this.usersService.findById(payload.sub);
      console.log('Found user:', user);
      return { userId: user.id, email: user.email, username: user.username };
    } catch (error) {
      console.error('JWT validation error:', error);
      return null;
    }
  }
}