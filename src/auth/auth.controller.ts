import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/role.decorator';
import { UserRole } from './entities/user-entity';
import { RolesGuard } from './guards/roles.guard';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userRegisterReq: UserRegisterDTO) {
    return this.authService.registerUser(userRegisterReq);
  }

  @Post('login')
  @UseGuards(LoginThrottlerGuard)
  async login(@Body() userLoginReq: UserLoginDTO) {
    return this.authService.login(userLoginReq);
  }

  @Post('refresh')
  @UseGuards(LoginThrottlerGuard)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JWTAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any): any {
    // getProfile(@CurrentUser() user: { id: number }) {
    // return this.authService.getUserById(user.id);
    return user;
  }

  @Post('register-admin')
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  registerAdmin(@Body() registerReq: UserRegisterDTO) {
    // return true;
    return this.authService.registerAdmin(registerReq);
  }
}
