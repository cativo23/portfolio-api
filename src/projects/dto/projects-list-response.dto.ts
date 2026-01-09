import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';
import {
  SuccessResponseDto,
  PaginationMetaDto,
  ResponseMetaDto,
} from '@core/dto';

/**
 * DTO for paginated projects list response
 */
export class ProjectsListResponseDto extends SuccessResponseDto<
  ProjectResponseDto[]
> {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectResponseDto],
  })
  data: ProjectResponseDto[];

  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  meta: ResponseMetaDto;

  /**
   * Create a ProjectsListResponseDto from an array of Project entities and pagination metadata
   * @param projects Array of Project entities
   * @param page Current page number
   * @param limit Items per page
   * @param totalItems Total number of items
   * @returns ProjectsListResponseDto
   */
  static fromEntities(
    projects: ProjectResponseDto[],
    page: number,
    limit: number,
    totalItems: number,
  ): ProjectsListResponseDto {
    const total_pages = Math.ceil(totalItems / limit);

    const paginationMeta: PaginationMetaDto = {
      page,
      limit,
      total_items: totalItems,
      total_pages,
    };

    return new SuccessResponseDto(projects, {
      pagination: paginationMeta,
    }) as ProjectsListResponseDto;
  }
}
