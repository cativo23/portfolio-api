import { ApiProperty } from '@nestjs/swagger';
import {
  SuccessResponseDto,
  ResponseMetaDto,
  PaginationMetaDto,
} from './success-response.dto';

/**
 * Base DTO for paginated list responses
 *
 * This class eliminates duplication of pagination logic across list response DTOs by:
 * 1. Extending SuccessResponseDto with array data and required meta property
 * 2. Providing a shared static method for creating paginated responses
 * 3. Ensuring consistent pagination metadata format across all paginated responses
 *
 * Implementation choice: We create this base class instead of repeating code because:
 * 1. DRY principle - eliminates code duplication
 * 2. Consistency - all paginated responses behave the same way
 * 3. Maintainability - changes to pagination format only need to be made once
 * 4. Type safety - avoids type assertions by using proper generics
 *
 * @template TItem Type of individual items in the paginated list (e.g., ProjectResponseDto, ContactResponseDto)
 */
export abstract class PaginatedResponseDto<TItem> extends SuccessResponseDto<
  TItem[]
> {
  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  meta: ResponseMetaDto;

  /**
   * Create a paginated response from items and pagination metadata
   *
   * This static method handles the common logic for creating paginated responses:
   * - Calculates total pages from total items and limit
   * - Creates pagination metadata
   * - Instantiates the response DTO with proper types
   *
   * @param items Array of items to include in the response
   * @param page Current page number
   * @param limit Items per page
   * @param totalItems Total number of items across all pages
   * @param ResponseClass The response DTO class to instantiate
   * @returns Instance of the paginated response DTO
   */
  protected static createPaginatedResponse<
    TItem,
    TResponse extends PaginatedResponseDto<TItem>,
  >(
    items: TItem[],
    page: number,
    limit: number,
    totalItems: number,
    ResponseClass: new (items: TItem[], meta: ResponseMetaDto) => TResponse,
  ): TResponse {
    const total_pages = Math.ceil(totalItems / limit);

    const paginationMeta: PaginationMetaDto = {
      page,
      limit,
      total_items: totalItems,
      total_pages,
    };

    const meta: ResponseMetaDto = {
      pagination: paginationMeta,
    };

    return new ResponseClass(items, meta);
  }

  /**
   * Constructor for paginated response
   * @param data Array of items
   * @param meta Response metadata containing pagination info
   */
  constructor(data: TItem[], meta: ResponseMetaDto) {
    super(data, meta);
    this.meta = meta;
  }
}
