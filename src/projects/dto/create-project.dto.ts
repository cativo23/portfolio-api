import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsBoolean,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '@projects/types/project-status';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ description: 'Project title', maxLength: 200 })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({ description: 'Project description', maxLength: 1000 })
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ description: 'Short description', maxLength: 500 })
  shortDescription: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  @ApiPropertyOptional({ description: 'Live URL' })
  liveUrl?: string;

  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  @ApiProperty({ description: 'Repository URL' })
  repoUrl: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is the project featured?' })
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @ApiPropertyOptional({ description: 'Tech stack', type: [String], maxItems: 20 })
  techStack?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  @ApiPropertyOptional({ description: 'Main content (Markdown or HTML) for case study', maxLength: 50000 })
  content?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  @ApiPropertyOptional({ description: 'Hero image URL', maxLength: 2048 })
  heroImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  @ApiPropertyOptional({ description: 'Key features of the project', type: [String], maxItems: 20 })
  features?: string[];

  @IsOptional()
  @IsEnum(ProjectStatus)
  @ApiPropertyOptional({
    description: 'Project status',
    enum: ProjectStatus,
    default: ProjectStatus.COMPLETED,
  })
  status?: ProjectStatus;
}
