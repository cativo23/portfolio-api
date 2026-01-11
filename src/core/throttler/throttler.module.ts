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
 * We use @nestjs/throttler because:
 * 1. Official NestJS package for rate limiting
 * 2. Production-ready and battle-tested
 * 3. Supports multiple storage backends (memory, Redis, etc.)
 * 4. Flexible configuration (per-route, per-module, global)
 * 5. Works seamlessly with NestJS guards and decorators
 * 6. Industry standard for NestJS applications
 *
 * Rate limiting configuration:
 * - Default: 100 requests per minute (for authenticated endpoints)
 * - Public: 10 requests per minute (for public endpoints)
 * - Strict: 5 requests per minute (for auth endpoints like login/register)
 */
@Global()
@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 1 minute in milliseconds
                limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests per minute
            },
            {
                name: 'public',
                ttl: parseInt(process.env.THROTTLE_PUBLIC_TTL || '60000', 10), // 1 minute
                limit: parseInt(process.env.THROTTLE_PUBLIC_LIMIT || '10', 10), // 10 requests per minute
            },
            {
                name: 'strict',
                ttl: parseInt(process.env.THROTTLE_STRICT_TTL || '60000', 10), // 1 minute
                limit: parseInt(process.env.THROTTLE_STRICT_LIMIT || '5', 10), // 5 requests per minute
            },
        ]),
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
export class AppThrottlerModule { }
