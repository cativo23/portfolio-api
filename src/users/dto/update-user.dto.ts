import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Username' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ description: 'User email' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @ApiPropertyOptional({
    description: 'New password (leave blank to keep current)',
  })
  password?: string;
}
