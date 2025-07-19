import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userRegisterReq: UserRegisterDTO) {
    return this.authService.registerUser(userRegisterReq);
  }

  @Post('login')
  async login(@Body() userLoginReq: UserLoginDTO) {
    return this.authService.login(userLoginReq);
  }

  @Post('login')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
