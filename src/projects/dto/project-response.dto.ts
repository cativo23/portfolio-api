import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@projects/entities/project.entity';
import { ProjectStatus } from '@projects/types/project-status';

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

  @ApiProperty({ description: 'Tech stack', type: [String] })
  techStack: string[];

  @ApiProperty({
    description: 'Main content (Markdown or HTML)',
    required: false,
  })
  content?: string;

  @ApiProperty({ description: 'Hero image URL', required: false })
  heroImage?: string;

  @ApiProperty({ description: 'Key features', type: [String] })
  features: string[];

  @ApiProperty({
    description: 'The problem this project solves',
    required: false,
  })
  problem?: string;

  @ApiProperty({
    description: "Carlos's role on this project",
    required: false,
  })
  role?: string;

  @ApiProperty({
    description: 'The concrete outcome/result',
    required: false,
  })
  outcome?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    default: ProjectStatus.COMPLETED,
  })
  status: ProjectStatus;

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
    dto.liveUrl = project.liveUrl ?? undefined;
    dto.repoUrl = project.repoUrl;
    dto.isFeatured = project.isFeatured;
    dto.techStack = project.techStack ?? [];
    dto.content = project.content;
    dto.heroImage = project.heroImage;
    dto.features = project.features ?? [];
    dto.problem = project.problem ?? undefined;
    dto.role = project.role ?? undefined;
    dto.outcome = project.outcome ?? undefined;
    dto.status = project.status ?? ProjectStatus.COMPLETED;
    dto.createdAt = project.createdAt;
    dto.updatedAt = project.updatedAt;
    return dto;
  }
}
