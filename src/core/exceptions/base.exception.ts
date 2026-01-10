import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@core/dto';

/**
 * Base exception class that all custom exceptions should extend
 */
export class BaseException extends HttpException {
  /**
   * Error code
   */
  readonly code: ErrorCode;

  /**
   * Additional error details
   */
  readonly details?: Record<string, any>;

  /**
   * Constructor
   * @param message Error message
   * @param code Error code
   * @param status HTTP status code
   * @param details Additional error details
   */
  constructor(
    message: string,
    code: ErrorCode,
    status: HttpStatus,
    details?: Record<string, any>,
  ) {
    super(message, status);
    this.code = code;
    this.details = details;
  }
}
