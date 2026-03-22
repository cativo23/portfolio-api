import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@projects/entities/project.entity';

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

  @ApiProperty({ description: 'Tech stack', type: [String], required: false })
  techStack?: string[];

  @ApiProperty({ description: 'Main content (Markdown or HTML)', required: false })
  content?: string;

  @ApiProperty({ description: 'Hero image URL', required: false })
  heroImage?: string;

  @ApiProperty({ description: 'Key features', type: [String], required: false })
  features?: string[];

  @ApiProperty({ description: 'Project status', default: 'Completed' })
  status: string;

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
    dto.techStack = project.techStack || [];
    dto.content = project.content;
    dto.heroImage = project.heroImage;
    dto.features = project.features || [];
    dto.status = project.status || 'Completed';
    dto.createdAt = project.createdAt;
    dto.updatedAt = project.updatedAt;
    return dto;
  }
}
