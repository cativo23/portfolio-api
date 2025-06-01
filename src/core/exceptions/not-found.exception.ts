import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../dto';

/**
 * Exception for resource not found errors
 */
export class NotFoundException extends BaseException {
  /**
   * Constructor
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message = 'Resource not found', details?: Record<string, any>) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, details);
  }
}
