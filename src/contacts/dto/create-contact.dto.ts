import { Transform } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEmpty,
} from 'class-validator';
// CommonJS-style import: sanitize-html exports via `export = sanitize`.
// Default-import (`import x from`) compiles to `.default` access without
// esModuleInterop in tsconfig, which fails at runtime under tsc. The
// `import = require` form works under both tsc and vitest's Vite ESM transform.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitize(value: string): string {
  return sanitizeHtml(value, SANITIZE_OPTIONS);
}

/**
 * DTO for creating a contact form submission
 */
export class CreateContactDto {
  @Transform(({ value }) => sanitize(value))
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

  @Transform(({ value }) => sanitize(value))
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

  @Transform(({ value }) => sanitize(value))
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({
    description: 'Optional subject line',
    example: 'Project Inquiry',
    maxLength: 200,
  })
  subject?: string;

  @IsOptional()
  @IsEmpty({ message: 'If this field is filled, the request will be rejected' })
  @ApiHideProperty()
  website?: string;
}
