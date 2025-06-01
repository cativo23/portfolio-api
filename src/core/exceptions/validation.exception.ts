import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '@core/dto';

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
    super(message, ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, details);
  }
}
