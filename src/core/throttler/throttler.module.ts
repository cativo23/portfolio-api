import { Module, Global } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Global throttler module for rate limiting
 *
 * Implementation choice: We make this module global because:
 * 1. Rate limiting should apply across all modules
 * 2. Avoids repetitive imports in every module
 * 3. Single source of truth for rate limiting configuration
 * 4. Follows NestJS best practices for cross-cutting concerns
 *
 * IMPORTANT: Only ONE throttle configuration is used at a time.
 * The @Throttle decorator overrides the global default for specific routes.
 *
 * Rate limiting configuration (global default):
 * - Default: 100 requests per minute (for authenticated endpoints)
 *
 * For specific limits, use @Throttle decorator on controllers:
 * - Public endpoints: @Throttle({ default: { limit: 10, ttl: 60 } })
 * - Auth endpoints: @Throttle({ default: { limit: 5, ttl: 60 } })
 */
@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 1 minute in milliseconds
          limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests per minute
        },
      ],
    }),
  ],
  providers: [
    // Register ThrottlerGuard globally to protect all routes by default
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
