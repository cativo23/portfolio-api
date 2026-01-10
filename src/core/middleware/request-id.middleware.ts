import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from '@core/context/request-context.interface';

/**
 * Middleware that generates a unique request ID and stores request context
 * using AsyncLocalStorage (via nestjs-cls) for type-safe access throughout the request lifecycle.
 *
 * This request ID is used for:
 * - Tracking requests in logs
 * - Correlating errors with logs in production
 * - Providing users with a reference ID when reporting issues
 *
 * Implementation choice: We use `crypto.randomBytes(6)` (12 hex chars) for production-ready uniqueness:
 * 1. **Collision Resistance**: 48 bits = ~281 trillion possibilities
 *    - Birthday paradox: ~16 million requests for 50% collision probability
 *    - Suitable for high-traffic production APIs
 * 2. **Performance**: Direct byte generation, no waste
 * 3. **Security**: Cryptographically secure random number generator
 * 4. **Readability**: Still short enough to communicate (12 hex chars)
 * 5. **Format**: "req_" prefix + 12 hex characters (e.g., "req_88229911aabb")
 *
 * Why not use full UUID?
 * - 12 hex chars provides excellent collision resistance for production
 * - Shorter than UUID (32 chars) but still very safe
 * - Easier to communicate to support than full UUID
 *
 * Why use nestjs-cls (AsyncLocalStorage)?
 * - Production-ready pattern used by major companies
 * - Type-safe context access (no type casting)
 * - Works automatically with async/await and Promises
 * - No need to pass request object through every function
 * - Better than attaching to request object (cleaner, type-safe)
 * - Follows Node.js best practices (AsyncLocalStorage is built-in Node.js 12.17.0+)
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) { }

  use(req: Request, res: Response, next: NextFunction) {
    // Generate a unique request ID
    // randomBytes(6) generates 6 bytes = 48 bits = 12 hex characters
    // Format: "req_" prefix + 12 hex characters for production-ready uniqueness
    const randomHex = randomBytes(6).toString('hex');
    const requestId = `req_${randomHex}`;

    // Store request context in AsyncLocalStorage for type-safe access
    // This makes the context available throughout the entire request lifecycle
    // without needing to pass the request object around
    const context: RequestContext = {
      requestId,
      path: req.url,
      method: req.method,
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Set context in CLS (AsyncLocalStorage)
    this.cls.set('requestContext', context);

    // Set response header for client tracking
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
