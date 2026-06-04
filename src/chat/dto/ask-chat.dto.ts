import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEmpty,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsIn,
} from 'class-validator';
// CommonJS-style import — see create-contact.dto.ts for the rationale.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitize(value: unknown): unknown {
  return typeof value === 'string'
    ? sanitizeHtml(value, SANITIZE_OPTIONS)
    : value;
}

/**
 * A prior conversation turn supplied by the client for multi-turn context.
 * The chat is stateless server-side: the client replays recent turns on each
 * request. Roles are restricted to user/assistant (the system turn is built
 * server-side and never accepted from the client), and content is sanitized
 * exactly like the question — a client could forge an "assistant" turn, so the
 * same prompt-injection defenses must apply to it.
 */
export class ChatTurnDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  @ApiProperty({
    description: 'Who produced this prior turn',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  role: 'user' | 'assistant';

  @Transform(({ value }) => sanitize(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    description: 'The text of a prior conversation turn',
    maxLength: 2000,
  })
  content: string;
}

export class AskChatDto {
  @Transform(({ value }) => sanitize(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description:
      'A question about Carlos (his experience, skills, projects, contact)',
    example: 'What is your main tech stack?',
    minLength: 1,
    maxLength: 500,
  })
  question: string;

  /**
   * Recent conversation turns (oldest first), capped at 6 so token cost and
   * latency stay bounded. The client is responsible for dropping older turns.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  @ApiProperty({
    description:
      'Prior conversation turns (oldest first) for multi-turn context. Capped at 6.',
    type: [ChatTurnDto],
    required: false,
  })
  history?: ChatTurnDto[];

  @IsOptional()
  @IsEmpty({ message: 'If this field is filled, the request will be rejected' })
  @ApiHideProperty()
  website?: string;
}
