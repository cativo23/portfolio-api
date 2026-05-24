import { Module, Global } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { loadThrottlerConfig } from '@config/configuration.loaders';

const throttlerConfig = loadThrottlerConfig();

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
 * - Default: 100 requests per 60 seconds (for authenticated endpoints)
 *
 * NOTE: NestJS throttler v6+ uses seconds for ttl, not milliseconds.
 * THROTTLE_TTL env var must be set in seconds (default: 60).
 *
 * For specific limits, use @Throttle decorator on controllers:
 * - Public endpoints: @Throttle({ default: { limit: publicLimit, ttl: 60 } })
 * - Auth endpoints:   @Throttle({ default: { limit: strictLimit, ttl: 60 } })
 */
@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: throttlerConfig.ttl, // seconds
          limit: throttlerConfig.limit,
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
