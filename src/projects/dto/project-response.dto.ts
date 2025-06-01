import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../entities/project.entity';

/**
 * DTO for project response
 */
export class ProjectResponseDto {
  @ApiProperty({ description: 'Project ID' })
  id: number;

  @ApiProperty({ description: 'Project title' })
  title: string;

  @ApiProperty({ description: 'Project description' })
  description: string;

  @ApiProperty({ description: 'Short description' })
  shortDescription: string;

  @ApiProperty({ description: 'Live URL', required: false })
  liveUrl?: string;

  @ApiProperty({ description: 'Repository URL' })
  repoUrl: string;

  @ApiProperty({ description: 'Is the project featured?' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Create a ProjectResponseDto from a Project entity
   * @param project Project entity
   * @returns ProjectResponseDto
   */
  static fromEntity(project: Project): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = project.id;
    dto.title = project.title;
    dto.description = project.description;
    dto.shortDescription = project.shortDescription;
    dto.liveUrl = project.liveUrl;
    dto.repoUrl = project.repoUrl;
    dto.isFeatured = project.isFeatured;
    dto.createdAt = project.createdAt;
    dto.updatedAt = project.updatedAt;
    return dto;
  }
}
