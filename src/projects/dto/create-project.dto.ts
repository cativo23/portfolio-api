import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
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
  @IsUrl()
  @ApiPropertyOptional({ description: 'Live URL' })
  liveUrl?: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({ description: 'Repository URL' })
  repoUrl: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is the project featured?' })
  isFeatured?: boolean;
}
