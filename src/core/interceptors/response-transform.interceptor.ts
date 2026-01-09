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
        // If the response is already a SuccessResponseDto or ErrorResponseDto, return it as is
        // but ensure it has request_id
        console.log(data);
        if (
          data &&
          typeof data === 'object' &&
          (data.status === 'success' || data.status === 'error')
        ) {
          if (!data.request_id) {
            data.request_id = requestId;
          }
          return data;
        }

        // Check if the response includes pagination metadata
        // Supports both NestJS pagination format and custom format
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'meta' in data &&
          data.meta &&
          typeof data.meta === 'object' &&
          ('totalItems' in data.meta || 'total_items' in data.meta) &&
          ('itemCount' in data.meta || 'currentPage' in data.meta) &&
          ('itemsPerPage' in data.meta || 'limit' in data.meta) &&
          ('totalPages' in data.meta || 'total_pages' in data.meta);

        // Transform paginated response
        if (isPaginated) {
          const paginationMeta = {
            page:
              data.meta.currentPage ||
              data.meta.page ||
              (data.meta.itemCount ? 1 : 1),
            limit:
              data.meta.itemsPerPage ||
              data.meta.limit ||
              data.meta.itemCount ||
              10,
            total_items: data.meta.totalItems || data.meta.total_items || 0,
            total_pages:
              data.meta.totalPages ||
              data.meta.total_pages ||
              Math.ceil(
                (data.meta.totalItems || data.meta.total_items || 0) /
                  (data.meta.itemsPerPage || data.meta.limit || 10),
              ),
          };

          const response = new SuccessResponseDto(data.items, {
            pagination: paginationMeta,
          });
          response.request_id = requestId;
          return response;
        }

        // Transform regular response (no meta field for individual resources)
        const response = new SuccessResponseDto(data);
        response.request_id = requestId;
        return response;
      }),
    );
  }
}
