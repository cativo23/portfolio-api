import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ description: 'Username' })
  username: string;

  @IsEmail()
  @ApiProperty({ description: 'User Email' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'User Password' })
  @Transform(({ value }) => value.trim())
  password: string;
}
