/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from './entities/user-entity';
import { Repository } from 'typeorm';
import { UserRegisterDTO } from './dto/user-register.dto';
import * as bcrypt from 'bcrypt';
import { UserLoginDTO } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEventsService } from 'src/events/user-events.services';

// const {
//   JWT_SECRET,
//   JWT_REFRESH_SECRET,
//   JWT_EXPIRES_IN,
//   JWT_REFRESH_EXPIRES_IN,
// } = process.env;

@Injectable()
export class AuthService {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  constructor(
    @InjectRepository(UserEntity)
    private userRespository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userEventService: UserEventsService,
  ) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET')!;
    this.JWT_REFRESH_SECRET =
      this.configService.get<string>('JWT_REFRESH_SECRET')!;
    this.JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN')!;
    this.JWT_REFRESH_EXPIRES_IN = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    )!;
  }

  async registerUser(registerReq: UserRegisterDTO) {
    const existingUser = await this.userRespository.findOne({
      where: {
        email: registerReq.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email already in use! Try with diffrenet email',
      );
    }

    const hashPassword = await this.hashPassword(registerReq.password);
    const newUser = {
      email: registerReq.email,
      name: registerReq.name,
      password: hashPassword,
      role: UserRole.USER,
    };

    const userResp = await this.userRespository.save(newUser);

    // Emit the user registered event
    // for sending emails and other notifications
    this.userEventService.emitUserEvent(userResp);

    const { password, ...userResult } = userResp;
    return {
      user: userResult,
      message: 'Registration successful',
    };
  }

  async registerAdmin(registerReq: UserRegisterDTO) {
    const existingUser = await this.userRespository.findOne({
      where: {
        email: registerReq.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Admin Email already in use! Try with diffrenet email',
      );
    }

    const hashPassword = await this.hashPassword(registerReq.password);
    const newUser = {
      email: registerReq.email,
      name: registerReq.name,
      password: hashPassword,
      role: UserRole.ADMIN,
    };

    const userResp = await this.userRespository.save(newUser);

    const { password, ...userResult } = userResp;
    return {
      user: userResult,
      message: 'Admin registration successful',
    };
  }

  async login(userReq: UserLoginDTO) {
    const userCheck = await this.userRespository.findOne({
      where: {
        email: userReq.email,
      },
    });

    if (!userCheck) {
      throw new NotFoundException('User email not found!');
    }

    if (!(await this.verifyPassword(userReq.password, userCheck.password)))
      throw new UnauthorizedException('Invalid credentials');

    const { password, ...userResult } = userCheck;
    return {
      user: userResult,
      token: this.generateToken(userCheck),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private generateToken(userObj: UserEntity) {
    return {
      accessToken: this.generateAccessToken(userObj),
      refreshToken: this.generateRefreshToken(userObj),
    };
  }

  private generateAccessToken(userObj: UserEntity): string {
    const payload = {
      email: userObj.email,
      sub: userObj.id,
      role: userObj.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private generateRefreshToken(userObj: UserEntity): string {
    const payload = {
      sub: userObj.id,
    };

    return this.jwtService.sign(payload, {
      secret: this.JWT_REFRESH_SECRET,
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(token, {
        secret: this.JWT_REFRESH_SECRET,
      });

      const user = await this.userRespository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid Token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserById(id: number): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.userRespository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async verifyPassword(
    userReqPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    // return (await this.hashPassword(userReqPassword)) == dbPassword;
    return bcrypt.compare(userReqPassword, dbPassword);
  }
}
