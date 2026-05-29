import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: "The assistant's answer about Carlos",
    example: 'Carlos specializes in NestJS, Laravel and FastAPI.',
  })
  answer: string;

  @ApiProperty({
    description: 'Whether this answer was served from cache',
    example: false,
  })
  cached: boolean;

  constructor(answer: string, cached: boolean) {
    this.answer = answer;
    this.cached = cached;
  }
}
