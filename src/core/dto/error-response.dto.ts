import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@core/dto/base-response.dto';

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
 *
 * Implementation choice: We include path and timestamp in error responses because:
 * 1. Path helps developers quickly identify which endpoint failed
 * 2. Timestamp is crucial for debugging time-sensitive issues
 * 3. These fields are standard in production APIs for observability
 * 4. They help correlate errors with logs and monitoring systems
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
   * @example "Invalid input data"
   */
  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Invalid input data',
  })
  message: string;

  /**
   * Additional error details (if applicable)
   * For validation errors, this contains field-specific error messages
   */
  @ApiProperty({
    description: 'Additional error details (if applicable)',
    type: ErrorDetailsDto,
    required: false,
  })
  details?: ErrorDetailsDto;

  /**
   * API path where the error occurred
   * @example "/api/v1/auth/register"
   */
  @ApiProperty({
    description: 'API path where the error occurred',
    example: '/api/v1/auth/register',
  })
  path: string;

  /**
   * ISO 8601 timestamp when the error occurred
   * @example "2026-01-08T14:05:00Z"
   */
  @ApiProperty({
    description: 'ISO 8601 timestamp when the error occurred',
    example: '2026-01-08T14:05:00Z',
  })
  timestamp: string;
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
