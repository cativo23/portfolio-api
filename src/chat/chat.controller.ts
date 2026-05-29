import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@auth/decorators/public.decorator';
import { ChatService } from './chat.service';
import { AskChatDto, ChatResponseDto } from './dto';

// Strict per-IP limit for this public, quota-bearing endpoint. Read at module
// load because @Throttle is evaluated statically. Guard against a non-numeric
// or non-positive env value (NaN would make the throttle behavior undefined).
const PARSED_STRICT_LIMIT = Number(process.env.CHAT_STRICT_LIMIT);
const CHAT_STRICT_LIMIT =
  Number.isFinite(PARSED_STRICT_LIMIT) && PARSED_STRICT_LIMIT > 0
    ? PARSED_STRICT_LIMIT
    : 5;

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: CHAT_STRICT_LIMIT, ttl: 60 } })
  @ApiOperation({
    summary: 'Ask the portfolio assistant a question about Carlos',
  })
  @ApiBody({ type: AskChatDto })
  @ApiOkResponse({ description: 'The assistant answer', type: ChatResponseDto })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async ask(@Body() dto: AskChatDto): Promise<ChatResponseDto> {
    const { answer, cached } = await this.chatService.ask(dto.question);
    return new ChatResponseDto(answer, cached);
  }
}
