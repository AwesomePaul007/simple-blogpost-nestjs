import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

// const { JWT_SECRET } = process.env;

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // if (!JWT_SECRET) {
    //   throw new Error('JWT_SECRET environment variable is not defined');
    // }
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number; role: string }) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if ((user.role as string) !== payload.role) {
        throw new UnauthorizedException('Role mismatch');
      }
      return {
        ...user,
        role: payload.role,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
