import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@core/dto/base-response.dto';

/**
 * DTO for pagination metadata
 *
 * Implementation choice: We use snake_case (total_items, total_pages) instead of camelCase
 * because:
 * 1. It matches the examples provided and common REST API conventions
 * 2. Many API consumers (especially Python, Ruby) prefer snake_case
 * 3. It's more consistent with JSON API standards
 * 4. It's a common pattern in production APIs
 */
export class PaginationMetaDto {
  /**
   * Current page number
   * @example 1
   */
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  /**
   * Number of items per page
   * @example 10
   */
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  /**
   * Total number of items
   * @example 45
   */
  @ApiProperty({
    description: 'Total number of items',
    example: 45,
  })
  total_items: number;

  /**
   * Total number of pages
   * @example 5
   */
  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  total_pages: number;
}

/**
 * DTO for response metadata
 */
export class ResponseMetaDto {
  /**
   * Pagination metadata (if applicable)
   */
  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
    required: false,
  })
  pagination?: PaginationMetaDto;
}

/**
 * DTO for success responses
 * @template T Type of the response data
 *
 * Implementation choice: Meta is optional to match the examples where individual
 * resources don't include meta, but paginated collections do.
 */
export class SuccessResponseDto<T> extends BaseResponseDto {
  constructor(data: T, meta?: ResponseMetaDto) {
    super();
    this.status = 'success';
    this.data = data;
    // Only set meta if provided (for pagination)
    if (meta && meta.pagination) {
      this.meta = meta;
    }
  }

  /**
   * Response data
   */
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  /**
   * Response metadata (only included for paginated responses)
   */
  @ApiProperty({
    description: 'Response metadata (only included for paginated responses)',
    type: ResponseMetaDto,
    required: false,
  })
  meta?: ResponseMetaDto;
}
