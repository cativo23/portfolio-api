import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '@core/dto';

/**
 * Exception for rate limit errors (429 Too Many Requests)
 */
export class RateLimitException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details (e.g., retryAfter)
   */
  constructor(
    message = 'Too many requests. Please try again later',
    details?: Record<string, any>,
  ) {
    super(
      message,
      ErrorCode.RATE_LIMIT_ERROR,
      HttpStatus.TOO_MANY_REQUESTS,
      details,
    );
  }
}
