import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ description: 'Username' })
  username: string;

  @IsEmail()
  @ApiProperty({ description: 'User Email' })
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, and number',
    },
  )
  @ApiProperty({
    description:
      'User Password (min 8 chars, must include uppercase, lowercase, and number)',
  })
  @Transform(({ value }) => value.trim())
  password: string;
}
