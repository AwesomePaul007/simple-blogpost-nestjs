import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user-entity';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
export const ROLES_KEY = configService.get<string>('ROLES_KEY');

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
