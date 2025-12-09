import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../modules/auth/interfaces/request-with-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return false;

    // Check if user has permissions property (API Key User)
    if (user.permissions && Array.isArray(user.permissions)) {
      const hasPermission = requiredPermissions.every((perm) =>
        user.permissions!.includes(perm),
      );
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient API Key Permissions');
      }
    }

    // If no permissions property, assume JWT user (Root access)
    return true;
  }
}
