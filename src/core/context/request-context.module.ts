import { Module, Global } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { RequestContextService } from '@core/context/request-context.service';
import { RequestIdMiddleware } from '@core/middleware/request-id.middleware';

/**
 * Global module for request context management
 *
 * Implementation choice: We make this module global because:
 * 1. Request context is needed everywhere (services, interceptors, filters)
 * 2. Avoids repetitive imports in every module
 * 3. Single source of truth for context configuration
 * 4. Follows NestJS best practices for cross-cutting concerns
 *
 * Why nestjs-cls?
 * - Production-ready solution using Node.js AsyncLocalStorage
 * - Type-safe context access
 * - Works automatically with async/await
 * - No need to pass request object through every function
 * - Used by major companies in production
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: () => {
          // Request context will be set by RequestIdMiddleware
          // This ensures CLS is initialized for every request
          // The middleware runs after CLS middleware, so context is available
        },
      },
    }),
  ],
  providers: [RequestContextService, RequestIdMiddleware],
  exports: [RequestContextService, ClsModule, RequestIdMiddleware],
})
export class RequestContextModule {}
