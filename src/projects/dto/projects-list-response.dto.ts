import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from '@projects/dto/project-response.dto';
import { PaginatedResponseDto, ResponseMetaDto } from '@core/dto';

/**
 * DTO for paginated projects list response
 */
export class ProjectsListResponseDto extends PaginatedResponseDto<ProjectResponseDto> {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectResponseDto],
  })
  data: ProjectResponseDto[];

  /**
   * Create a ProjectsListResponseDto from an array of Project response DTOs and pagination metadata
   * @param projects Array of Project response DTOs
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
    return PaginatedResponseDto.createPaginatedResponse(
      projects,
      page,
      limit,
      totalItems,
      ProjectsListResponseDto,
    );
  }

  /**
   * Constructor for ProjectsListResponseDto
   * @param data Array of project response DTOs
   * @param meta Response metadata containing pagination info
   */
  constructor(data: ProjectResponseDto[], meta: ResponseMetaDto) {
    super(data, meta);
  }
}
