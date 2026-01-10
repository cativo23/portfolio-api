import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@core/dto';

/**
 * DTO for query parameters when finding all contacts
 *
 * Extends PaginationQueryDto to include contact-specific filters.
 */
export class FindAllContactsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by read status',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  is_read?: boolean;
}
