import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user-entity';

// Use a constant for the metadata key - this ensures consistency
// and avoids timing issues with environment variable loading
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
