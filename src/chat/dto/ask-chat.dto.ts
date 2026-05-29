import { Transform } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEmpty,
} from 'class-validator';
// CommonJS-style import — see create-contact.dto.ts for the rationale.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitize(value: unknown): unknown {
  return typeof value === 'string' ? sanitizeHtml(value, SANITIZE_OPTIONS) : value;
}

export class AskChatDto {
  @Transform(({ value }) => sanitize(value))
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @ApiProperty({
    description: 'A question about Carlos (his experience, skills, projects, contact)',
    example: 'What is your main tech stack?',
    minLength: 3,
    maxLength: 500,
  })
  question: string;

  @IsOptional()
  @IsEmpty({ message: 'If this field is filled, the request will be rejected' })
  @ApiHideProperty()
  website?: string;
}
