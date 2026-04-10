import { ApiProperty } from '@nestjs/swagger';

export class ProfileExperienceDto {
  @ApiProperty({ example: 'Blue Medical Guatemala' })
  company: string;

  @ApiProperty({ example: 'Tech Lead / Full-Stack Engineer' })
  role: string;

  @ApiProperty({ example: 'Apr 2022 - Present' })
  period: string;

  @ApiProperty({ example: 'Guatemala (Remote)', required: false })
  location?: string;
}

export class ProfileSkillDto {
  @ApiProperty({ example: 'TypeScript' })
  name: string;

  @ApiProperty({ example: 'advanced', enum: ['advanced', 'intermediate', 'basic'] })
  level: string;
}

export class ProfileSkillCategoryDto {
  @ApiProperty({ example: 'Languages' })
  name: string;

  @ApiProperty({ type: [ProfileSkillDto] })
  skills: ProfileSkillDto[];
}

export class ProfileResponseDto {
  @ApiProperty({ example: 'Carlos Cativo' })
  name: string;

  @ApiProperty({ example: 'Tech Lead / Full-Stack Engineer' })
  title: string;

  @ApiProperty({ example: 9 })
  yearsOfExperience: number;

  @ApiProperty({ example: 'San Salvador, El Salvador' })
  location: string;

  @ApiProperty({ example: 'Remote Tech Lead and Full-Stack Software Engineer with 9 years of experience building healthcare platforms, payment systems, and AI-powered products.' })
  summary: string;

  @ApiProperty({ type: [ProfileExperienceDto] })
  experience: ProfileExperienceDto[];

  @ApiProperty({ type: [ProfileSkillCategoryDto] })
  skills: ProfileSkillCategoryDto[];

  @ApiProperty({ type: [String] })
  differentiators: string[];

  @ApiProperty({ example: 'https://github.com/cativo23' })
  github: string;

  @ApiProperty({ example: 'https://linkedin.com/in/cativo23' })
  linkedin: string;

  @ApiProperty({ example: 'https://cativo.dev' })
  website: string;
}
