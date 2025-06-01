import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base-response.dto';

/**
 * Error codes for API responses
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * DTO for error details
 */
export class ErrorDetailsDto {
  /**
   * Additional error details (if applicable)
   */
  [key: string]: any;
}

/**
 * DTO for error information
 */
export class ErrorInfoDto {
  /**
   * Error code
   * @example "VALIDATION_ERROR"
   */
  @ApiProperty({
    description: 'Error code',
    enum: ErrorCode,
    example: ErrorCode.VALIDATION_ERROR,
  })
  code: ErrorCode;

  /**
   * Human-readable error message
   * @example "Validation failed"
   */
  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Validation failed',
  })
  message: string;

  /**
   * Additional error details (if applicable)
   */
  @ApiProperty({
    description: 'Additional error details',
    type: ErrorDetailsDto,
    required: false,
  })
  details?: ErrorDetailsDto;
}

/**
 * DTO for error responses
 */
export class ErrorResponseDto extends BaseResponseDto {
  constructor(error: ErrorInfoDto) {
    super();
    this.status = 'error';
    this.error = error;
  }

  /**
   * Error information
   */
  @ApiProperty({
    description: 'Error information',
    type: ErrorInfoDto,
  })
  error: ErrorInfoDto;
}
