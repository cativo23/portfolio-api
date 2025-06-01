import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '../dto';

/**
 * Exception for validation errors
 */
export class ValidationException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Validation error details
   */
  constructor(message = 'Validation failed', details?: Record<string, any>) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}
