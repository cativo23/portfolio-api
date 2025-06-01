import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';
import { SuccessResponseDto } from '@core/dto';
import { Project } from '../entities/project.entity';

/**
 * DTO for single project response
 */
export class SingleProjectResponseDto extends SuccessResponseDto<ProjectResponseDto> {
  @ApiProperty({
    description: 'Project data',
    type: ProjectResponseDto,
  })
  data: ProjectResponseDto;

  /**
   * Create a SingleProjectResponseDto from a Project entity
   * @param project Project entity
   * @returns SingleProjectResponseDto
   */
  static fromEntity(project: Project): SingleProjectResponseDto {
    const projectDto = ProjectResponseDto.fromEntity(project);
    return new SuccessResponseDto(projectDto) as SingleProjectResponseDto;
  }
}
