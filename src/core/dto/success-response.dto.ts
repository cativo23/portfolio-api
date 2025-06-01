import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base-response.dto';

/**
 * DTO for pagination metadata
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
   * @example 100
   */
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  totalItems: number;

  /**
   * Total number of pages
   * @example 10
   */
  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
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
 */
export class SuccessResponseDto<T> extends BaseResponseDto {
  constructor(data: T, meta?: ResponseMetaDto) {
    super();
    this.status = 'success';
    this.data = data;
    this.meta = meta || {};
  }

  /**
   * Response data
   */
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  /**
   * Response metadata
   */
  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  meta: ResponseMetaDto;
}
