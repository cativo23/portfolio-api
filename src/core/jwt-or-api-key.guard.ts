import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@auth/auth.guard';
import { ApiKeyGuard } from '@core/api-key.guard';
import { ModuleRef } from '@nestjs/core';
import { AuthenticationException } from '@core/exceptions';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(JwtOrApiKeyGuard.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Dynamically resolve guards
    const authGuard = this.moduleRef.get(AuthGuard, { strict: false });
    const apiKeyGuard = this.moduleRef.get(ApiKeyGuard, { strict: false });

    // Try JWT first
    if (authGuard) {
      try {
        if (await authGuard.canActivate(context)) {
          return true;
        }
      } catch (error) {
        // Only catch authentication errors, not unexpected errors
        if (
          error instanceof AuthenticationException ||
          error instanceof UnauthorizedException
        ) {
          // Expected authentication error - try API key
          this.logger.debug('JWT authentication failed, trying API key');
        } else {
          // Unexpected error - log and re-throw
          this.logger.error('Unexpected error in JWT guard', error);
          throw error;
        }
      }
    }

    // Try API Key
    if (apiKeyGuard) {
      try {
        if (await apiKeyGuard.canActivate(context)) {
          return true;
        }
      } catch (error) {
        // Only catch authentication errors
        if (
          error instanceof AuthenticationException ||
          error instanceof UnauthorizedException
        ) {
          // Both authentication methods failed - return false
          this.logger.debug('API key authentication also failed');
        } else {
          // Unexpected error - log and re-throw
          this.logger.error('Unexpected error in API key guard', error);
          throw error;
        }
      }
    }

    // Both authentication methods failed or were unavailable
    return false;
  }
}
