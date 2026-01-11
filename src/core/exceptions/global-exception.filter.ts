import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto, ErrorCode } from '@core/dto';
import { BaseException } from '@core/exceptions';
import { RequestContextService } from '@core/context/request-context.service';

/**
 * Global exception filter that transforms all exceptions into standardized error responses
 *
 * Implementation choice: We use a global exception filter instead of handling errors
 * in each controller because:
 * 1. DRY principle - centralized error handling
 * 2. Consistency - all errors follow the same format
 * 3. Security - prevents leaking sensitive error details in production
 * 4. Observability - automatically includes request_id, path, and timestamp
 * 5. Maintainability - changes to error format only need to be made in one place
 *
 * We use RequestContextService instead of accessing request object directly because:
 * 1. Type-safe - no type casting needed
 * 2. Cleaner - no need to extract from request object
 * 3. Consistent - same pattern used throughout the application
 * 4. Works even if request object is not available in some error scenarios
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly requestContext: RequestContextService) { }

  /**
   * Catch method that handles exceptions
   * @param exception The exception that was thrown
   * @param host The argument host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get request context from service (type-safe, works even if request is corrupted)
    const requestId = this.requestContext.getRequestId();
    const path = this.requestContext.getPath() || request.url;
    const timestamp = this.requestContext.getTimestamp();

    // Log the exception with request ID for correlation
    this.logger.error(
      `[${requestId}] Exception occurred: ${exception instanceof Error ? exception.message : 'Unknown error'} | ` +
      `Request: ${request.method} ${request.url} | IP: ${request.ip}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof BaseException) {
      const errorResponse = new ErrorResponseDto({
        code: exception.code,
        message: exception.message,
        details: exception.details,
        path,
        timestamp,
      });
      errorResponse.request_id = requestId;
      response.status(exception.getStatus()).json(errorResponse);
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse &&
          typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : exception.message;

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
        case HttpStatus.CONFLICT:
          code = ErrorCode.CONFLICT_ERROR;
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          code = ErrorCode.RATE_LIMIT_ERROR;
          break;
        default:
          code = ErrorCode.INTERNAL_SERVER_ERROR;
      }

      const errorResponse = new ErrorResponseDto({
        code,
        message,
        details:
          typeof exceptionResponse === 'object' &&
            'message' in exceptionResponse &&
            Array.isArray(exceptionResponse.message)
            ? { errors: exceptionResponse.message }
            : undefined,
        path,
        timestamp,
      });
      errorResponse.request_id = requestId;

      response.status(status).json(errorResponse);
    } else {
      // Log the full error for internal monitoring but do not expose details to the client
      this.logger.error(`[${requestId}] Unhandled exception`, exception as any);

      const errorResponse = new ErrorResponseDto({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message:
          'An unexpected error occurred. Please contact support with the request ID.',
        path,
        timestamp,
      });
      errorResponse.request_id = requestId;

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }
}
