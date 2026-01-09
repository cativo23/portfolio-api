import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from './request-context.interface';

/**
 * Service for accessing request context in a type-safe manner
 *
 * Implementation choice: We use a service instead of directly accessing CLS because:
 * 1. Type safety - ensures correct usage of context data
 * 2. Abstraction - hides implementation details (CLS)
 * 3. Testability - easier to mock in tests
 * 4. Consistency - single source of truth for context access
 * 5. Future-proof - can change implementation without breaking code
 *
 * Why nestjs-cls (AsyncLocalStorage)?
 * - Production-ready solution used by major companies
 * - No need to pass request object through every function
 * - Works with async/await and Promises automatically
 * - Type-safe context access
 * - Better than attaching to request object (no type casting needed)
 * - Follows Node.js best practices (AsyncLocalStorage is built-in)
 */
@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService) {}

  /**
   * Get the current request context
   * @returns Request context or undefined if not in request scope
   */
  getContext(): RequestContext | undefined {
    return this.cls.get<RequestContext>('requestContext');
  }

  /**
   * Get the request ID from context
   * @returns Request ID or 'unknown' if not available
   */
  getRequestId(): string {
    return this.getContext()?.requestId || 'unknown';
  }

  /**
   * Get the request path from context
   * @returns Request path or empty string if not available
   */
  getPath(): string {
    return this.getContext()?.path || '';
  }

  /**
   * Get the request method from context
   * @returns Request method or empty string if not available
   */
  getMethod(): string {
    return this.getContext()?.method || '';
  }

  /**
   * Get the client IP from context
   * @returns Client IP or empty string if not available
   */
  getIp(): string {
    return this.getContext()?.ip || '';
  }

  /**
   * Get the request timestamp from context
   * @returns Request timestamp or current ISO timestamp if not available
   */
  getTimestamp(): string {
    return this.getContext()?.timestamp || new Date().toISOString();
  }
}
