import { ProjectResponseDto } from './project-response.dto';
import { SingleResourceResponseDto } from '@core/dto';
import { Project } from '../entities/project.entity';

/**
 * DTO for a single project response
 *
 * Uses SingleResourceResponseDto base class to eliminate code duplication.
 * Single resource responses don't include pagination metadata.
 */
export class SingleProjectResponseDto extends SingleResourceResponseDto<ProjectResponseDto> {
  /**
   * Create a SingleProjectResponseDto from a Project entity
   * @param project Project entity
   * @returns SingleProjectResponseDto
   */
  static fromEntity(project: Project): SingleProjectResponseDto {
    const projectDto = ProjectResponseDto.fromEntity(project);
    return new SingleProjectResponseDto(projectDto);
  }
}
