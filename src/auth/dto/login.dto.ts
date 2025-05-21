//Create a login DTO
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'User Email' })
  email: string;

  @IsString()
  @ApiProperty({ description: 'User Password' })
  password: string;
}
