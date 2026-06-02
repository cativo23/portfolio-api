import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import type { ChatConfig } from '@config/chat.config';
import { SystemPromptService } from './system-prompt.service';
import { OutputGuardService } from './output-guard.service';
import {
  CHAT_PROVIDER,
  ChatProvider,
} from './providers/chat-provider.interface';
import { ChatProviderError } from './providers/chat-provider.error';
import { ChatUnavailableException } from './chat-unavailable.exception';

export interface ChatAnswer {
  answer: string;
  cached: boolean;
}

const CACHE_PREFIX = 'chat';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly cacheTtlMs: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CHAT_PROVIDER) private readonly provider: ChatProvider,
    private readonly systemPromptService: SystemPromptService,
    private readonly outputGuard: OutputGuardService,
    configService: ConfigService,
  ) {
    const config = configService.getOrThrow<ChatConfig>('chat');
    this.cacheTtlMs = config.cacheTtlSeconds * 1000;
  }

  async ask(question: string): Promise<ChatAnswer> {
    const cacheKey = this.cacheKey(question);

    const cachedAnswer = await this.cacheManager.get<string>(cacheKey);
    if (cachedAnswer != null) {
      this.logger.log(`Chat cache hit (${cacheKey})`);
      return { answer: cachedAnswer, cached: true };
    }

    const answer = await this.generate(question);
    await this.cacheManager.set(cacheKey, answer, this.cacheTtlMs);
    this.logger.log(`Chat cache miss (${cacheKey})`);
    return { answer, cached: false };
  }

  private async generate(question: string): Promise<string> {
    try {
      // The cache key is normalized, but the provider receives the original
      // question so the answer reflects the visitor's exact phrasing.
      const result = await this.provider.complete([
        { role: 'system', content: this.systemPromptService.build() },
        { role: 'user', content: question },
      ]);
      // Last line of defense: strip any system-prompt/profile leak before the
      // answer is returned or cached, regardless of how the model behaved.
      return this.outputGuard.sanitize(result.content);
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
