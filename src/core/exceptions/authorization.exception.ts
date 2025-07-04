import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@core/exceptions';
import { ErrorCode } from '../dto';

/**
 * Exception for authorization errors
 */
export class AuthorizationException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details
   */
  constructor(
    message = 'You are not authorized to perform this action',
    details?: Record<string, any>,
  ) {
    super(
      message,
      ErrorCode.AUTHORIZATION_ERROR,
      HttpStatus.FORBIDDEN,
      details,
    );
  }
}
