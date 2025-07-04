import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '../dto';

/**
 * Exception for internal server errors
 */
export class InternalServerException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details
   */
  constructor(
    message = 'Internal server error',
    details?: Record<string, any>,
  ) {
    super(
      message,
      ErrorCode.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    );
  }
}
