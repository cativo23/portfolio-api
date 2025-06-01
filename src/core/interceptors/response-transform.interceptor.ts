import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto } from '../dto';

/**
 * Interceptor that transforms all successful responses to follow the standardized format
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
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
    return next.handle().pipe(
      map((data) => {
        // If the response is already a SuccessResponseDto or ErrorResponseDto, return it as is
        if (
          data &&
          typeof data === 'object' &&
          (data.status === 'success' || data.status === 'error')
        ) {
          return data;
        }

        // Check if the response includes pagination metadata
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'meta' in data &&
          data.meta &&
          typeof data.meta === 'object' &&
          'totalItems' in data.meta &&
          'itemCount' in data.meta &&
          'itemsPerPage' in data.meta &&
          'totalPages' in data.meta &&
          'currentPage' in data.meta;

        // Transform paginated response
        if (isPaginated) {
          return new SuccessResponseDto(data.items, {
            pagination: {
              page: data.meta.currentPage,
              limit: data.meta.itemsPerPage,
              totalItems: data.meta.totalItems,
              totalPages: data.meta.totalPages,
            },
          });
        }

        // Transform regular response
        return new SuccessResponseDto(data);
      }),
    );
  }
}
