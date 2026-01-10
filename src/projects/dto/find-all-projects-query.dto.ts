import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@core/dto';

/**
 * DTO for query parameters when finding all projects
 *
 * Extends PaginationQueryDto to include project-specific filters.
 */
export class FindAllProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by featured status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  is_featured?: boolean;
}
