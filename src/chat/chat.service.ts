import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import type { ChatConfig } from '@config/chat.config';
import { SystemPromptService } from './system-prompt.service';
import { OutputSanitizerService } from './output-sanitizer.service';
import {
  CHAT_PROVIDER,
  ChatProvider,
  ChatMessage,
} from './providers/chat-provider.interface';
import { ChatProviderError } from './providers/chat-provider.error';
import { ChatUnavailableException } from './chat-unavailable.exception';

export interface ChatAnswer {
  answer: string;
  cached: boolean;
}

// Versioned prefix: bump the suffix whenever a prompt or model change should
// invalidate previously cached answers (orphans old keys, which then expire).
const CACHE_PREFIX = 'chat:v2';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly cacheTtlMs: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CHAT_PROVIDER) private readonly provider: ChatProvider,
    private readonly systemPromptService: SystemPromptService,
    private readonly outputSanitizer: OutputSanitizerService,
    configService: ConfigService,
  ) {
    const config = configService.getOrThrow<ChatConfig>('chat');
    this.cacheTtlMs = config.cacheTtlSeconds * 1000;
  }

  async ask(
    question: string,
    history: ChatMessage[] = [],
  ): Promise<ChatAnswer> {
    // Only first-turn questions (no prior context) are cacheable: a follow-up's
    // answer depends on the whole conversation, so a question-only key would
    // serve the wrong answer. Multi-turn requests skip the cache entirely.
    if (history.length === 0) {
      const cacheKey = this.cacheKey(question);

      const cachedAnswer = await this.cacheManager.get<string>(cacheKey);
      if (cachedAnswer != null) {
        this.logger.log(`Chat cache hit (${cacheKey})`);
        // Re-sanitize on read too: an answer cached before this guard shipped
        // (e.g. a leak captured during the pentest) must not be served verbatim.
        return {
          answer: this.outputSanitizer.sanitize(cachedAnswer),
          cached: true,
        };
      }

      const answer = await this.generate(question, history);
      await this.cacheManager.set(cacheKey, answer, this.cacheTtlMs);
      this.logger.log(`Chat cache miss (${cacheKey})`);
      return { answer, cached: false };
    }

    const answer = await this.generate(question, history);
    return { answer, cached: false };
  }

  private async generate(
    question: string,
    history: ChatMessage[],
  ): Promise<string> {
    try {
      // The provider receives the system prompt, the prior turns, and the
      // original question (exact phrasing preserved).
      const result = await this.provider.complete([
        { role: 'system', content: this.systemPromptService.build() },
        ...history,
        { role: 'user', content: question },
      ]);
      // Last line of defense: strip any system-prompt/profile leak before the
      // answer is returned or cached, regardless of how the model behaved.
      return this.outputSanitizer.sanitize(result.content);
    } catch (error) {
      if (error instanceof ChatProviderError) {
        this.logger.error('Chat provider unavailable');
        throw new ChatUnavailableException();
      }
      throw error;
    }
  }

  private cacheKey(question: string): string {
    const normalized = question.trim().toLowerCase().replace(/\s+/g, ' ');
    const hash = createHash('sha256').update(normalized).digest('hex');
    return `${CACHE_PREFIX}:${hash}`;
  }
}
