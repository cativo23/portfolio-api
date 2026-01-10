import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestContextService } from '../context/request-context.service';
import { SuccessResponseDto } from '../dto';

/**
 * Interceptor that transforms all successful responses to follow the standardized format
 *
 * Implementation choice: We use an interceptor instead of manually wrapping responses
 * in controllers because:
 * 1. DRY principle - no need to wrap every response manually
 * 2. Consistency - all responses automatically follow the same format
 * 3. Maintainability - changes to response format only need to be made in one place
 * 4. Separation of concerns - controllers focus on business logic, not response formatting
 *
 * We use RequestContextService instead of accessing request object directly because:
 * 1. Type-safe - no type casting needed
 * 2. Cleaner - no need to extract from request object
 * 3. Consistent - same pattern used throughout the application
 * 4. Testable - easier to mock in tests
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  constructor(private readonly requestContext: RequestContextService) {}

  /**
   * Intercept method that transforms the response
   * @param context Execution context
   * @param next Call handler
   * @returns Observable with transformed response
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseDto<T>> {
    // Get request ID from context service (type-safe, no casting needed)
    const requestId = this.requestContext.getRequestId();

    return next.handle().pipe(
      map((data) => {
        // If already a response DTO (has status property), just ensure request_id
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          (data.status === 'success' || data.status === 'error')
        ) {
          // Type guard: data is a BaseResponseDto (has status property)
          const responseData = data as SuccessResponseDto<unknown> & {
            request_id?: string;
          };
          if (!responseData.request_id) {
            responseData.request_id = requestId;
          }
          return responseData;
        }

        // Otherwise, wrap in SuccessResponseDto
        // Controllers should return DTOs directly, so this should rarely happen
        // (e.g., auth.login() returns LoginResponseDto, auth.register() returns User entity)
        const response = new SuccessResponseDto(data);
        response.request_id = requestId;
        return response;
      }),
    );
  }
}
