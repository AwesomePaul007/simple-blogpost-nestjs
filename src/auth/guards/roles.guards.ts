import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user-entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required for the route
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      this.configService.get<string>('ROLES_KEY'),
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    // Type fix for the request object
    // This is necessary to access the user object from the request
    type RequestWithUser = {
      user?: { role?: UserRole };
      [key: string]: any;
    };

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User not authenticated');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }
    return true; // User has the required role, allow access
  }
}
