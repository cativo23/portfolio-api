import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '@core/dto';

/**
 * Exception for conflict errors (e.g., resource already exists)
 */
export class ConflictException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message = 'Resource conflict', details?: Record<string, any>) {
    super(message, ErrorCode.CONFLICT_ERROR, HttpStatus.CONFLICT, details);
  }
}
