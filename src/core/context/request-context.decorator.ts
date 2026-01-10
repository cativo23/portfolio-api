import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from '@core/context/request-context.interface';

/**
 * Decorator to inject request context into controller methods
 *
 * Usage:
 * @Get()
 * async findAll(@InjectRequestContext() context: RequestContext) {
 *   const requestId = context.requestId;
 * }
 *
 * Note: For better reliability, prefer injecting RequestContextService directly:
 * constructor(private readonly requestContext: RequestContextService) {}
 *
 * Implementation choice: We provide a decorator for convenience, but the service
 * is more reliable because:
 * 1. Service uses proper DI - guaranteed to work
 * 2. Decorator has limitations accessing DI in param decorators
 * 3. Service is easier to test and mock
 */
export const RequestContextDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // nestjs-cls stores the ClsService instance in the request
    // Access it via the request's app context
    try {
      const app = request.app as any;
      if (app && typeof app.get === 'function') {
        const clsService = app.get(ClsService, { strict: false }) as
          | ClsService
          | undefined;
        return clsService?.get('requestContext') as RequestContext | undefined;
      }
    } catch {
      // If we can't access ClsService, return undefined
      // The service injection approach is more reliable
    }

    return undefined;
  },
);

/**
 * Decorator alias for cleaner usage
 * Note: Named InjectRequestContext to avoid conflict with RequestContext interface
 */
export const InjectRequestContext = RequestContextDecorator;
