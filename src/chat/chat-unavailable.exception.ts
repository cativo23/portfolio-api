import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '@core/dto';

/**
 * Raised when the upstream chat provider (e.g. Groq) is unreachable or fails.
 * Maps to HTTP 503 so a transient upstream outage is not reported as a generic
 * 500, and never leaks the underlying provider error to the client.
 */
export class ChatUnavailableException extends BaseException {
  constructor(
    message = 'The assistant is temporarily unavailable. Please try again shortly.',
  ) {
    super(message, ErrorCode.SERVICE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
