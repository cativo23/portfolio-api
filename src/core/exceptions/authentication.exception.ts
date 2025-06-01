import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../dto';

/**
 * Exception for authentication errors
 */
export class AuthenticationException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details
   */
  constructor(
    message = 'Authentication failed',
    details?: Record<string, any>,
  ) {
    super(
      message,
      ErrorCode.AUTHENTICATION_ERROR,
      HttpStatus.UNAUTHORIZED,
      details,
    );
  }
}
