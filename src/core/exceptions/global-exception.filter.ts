import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto, ErrorCode } from '../dto';
import { BaseException } from '@core/exceptions';

/**
 * Global exception filter that transforms all exceptions into standardized error responses
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Catch method that handles exceptions
   * @param exception The exception that was thrown
   * @param host The arguments host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the exception
    this.logger.error(
      `Exception occurred: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Handle different types of exceptions
    if (exception instanceof BaseException) {
      // Handle custom exceptions
      const errorResponse = new ErrorResponseDto({
        code: exception.code,
        message: exception.message,
        details: exception.details,
      });

      response.status(exception.getStatus()).json(errorResponse);
    } else if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : exception.message;

      // Map HTTP status codes to error codes
      let code: ErrorCode;
      switch (status) {
        case HttpStatus.BAD_REQUEST:
        case HttpStatus.UNPROCESSABLE_ENTITY:
          code = ErrorCode.VALIDATION_ERROR;
          break;
        case HttpStatus.UNAUTHORIZED:
          code = ErrorCode.AUTHENTICATION_ERROR;
          break;
        case HttpStatus.FORBIDDEN:
          code = ErrorCode.AUTHORIZATION_ERROR;
          break;
        case HttpStatus.NOT_FOUND:
          code = ErrorCode.RESOURCE_NOT_FOUND;
          break;
        default:
          code = ErrorCode.INTERNAL_SERVER_ERROR;
      }

      // Create error response
      const errorResponse = new ErrorResponseDto({
        code,
        message,
        details:
          typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse &&
          Array.isArray(exceptionResponse.message)
            ? { errors: exceptionResponse.message }
            : undefined,
      });

      response.status(status).json(errorResponse);
    } else {
      // Handle unknown exceptions
      const errorResponse = new ErrorResponseDto({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }
}
