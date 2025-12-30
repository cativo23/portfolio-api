import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ description: 'Project title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Project description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Short description' })
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Live URL' })
  liveUrl?: string;

  @ApiPropertyOptional({ description: 'Repository URL' })
  repoUrl?: string;

  @ApiPropertyOptional({ description: 'Is the project featured?' })
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Tech stack', type: [String] })
  techStack?: string[];
}
