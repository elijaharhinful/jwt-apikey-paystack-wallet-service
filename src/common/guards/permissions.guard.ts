import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Check if user has permissions property (API Key User)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.permissions && Array.isArray(user.permissions)) {
      const hasPermission = requiredPermissions.every((perm) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        user.permissions.includes(perm),
      );
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient API Key Permissions');
      }
    }

    // If no permissions property, assume JWT user (Root access)
    return true;
  }
}
