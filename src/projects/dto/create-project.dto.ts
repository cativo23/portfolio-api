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
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Project title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Project description' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Short description' })
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
  @ApiPropertyOptional({ description: 'Tech stack', type: [String] })
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
  @ApiPropertyOptional({ description: 'Key features of the project', type: [String] })
  features?: string[];

  @IsOptional()
  @IsEnum(['Completed', 'In Progress', 'Maintained'])
  @ApiPropertyOptional({
    description: 'Project status',
    enum: ['Completed', 'In Progress', 'Maintained'],
    default: 'Completed',
  })
  status?: string;
}
