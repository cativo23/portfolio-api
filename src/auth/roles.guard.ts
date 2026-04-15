import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@auth/decorators/roles.decorator';
import { Role } from '@users/entities/user.entity';
import { AuthenticationException } from '@core/exceptions';

/**
 * Guard that checks the authenticated user has at least one of the required roles.
 *
 * Must be used AFTER an authentication guard (e.g., AuthGuard) so that request.user exists.
 *
 * Usage:
 *   @UseGuards(AuthGuard, RolesGuard)
 *   @Roles('admin')
 *   async adminOnly() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new AuthenticationException(
        'Insufficient permissions to access this resource',
      );
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new AuthenticationException(
        'Insufficient permissions to access this resource',
      );
    }

    return true;
  }
}
