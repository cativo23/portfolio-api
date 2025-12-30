import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a contact form submission
 */
export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    description: 'Contact name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Contact email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @ApiProperty({
    description: 'Contact message',
    example: 'Hello, I would like to get in touch...',
    minLength: 10,
    maxLength: 1000,
  })
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({
    description: 'Optional subject line',
    example: 'Project Inquiry',
    maxLength: 200,
  })
  subject?: string;
}
