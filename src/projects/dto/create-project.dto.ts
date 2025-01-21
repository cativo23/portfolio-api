import { IsNotEmpty, IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';

export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    shortDescription: string;

    @IsOptional()
    @IsUrl()
    liveUrl?: string;

    @IsNotEmpty()
    @IsUrl()
    repoUrl: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;
}
