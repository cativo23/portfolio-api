import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { ChatConfig } from '@config/chat.config';
import {
  ChatProvider,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
} from './chat-provider.interface';
import { ChatProviderError } from './chat-provider.error';

interface GroqChoice {
  message?: { role: string; content?: string };
  finish_reason?: string;
}

interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface GroqCompletionResponse {
  choices?: GroqChoice[];
  usage?: GroqUsage;
}

/**
 * Groq implementation of ChatProvider, talking to the OpenAI-compatible
 * `/chat/completions` endpoint. Note Groq uses `max_completion_tokens`, not
 * OpenAI's `max_tokens`.
 */
@Injectable()
export class GroqChatProvider implements ChatProvider {
  private readonly logger = new Logger(GroqChatProvider.name);
  private readonly config: ChatConfig;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.config = configService.getOrThrow<ChatConfig>('chat');
  }

  async complete(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResult> {
    const url = `${this.config.groqBaseUrl}/chat/completions`;
    const body = {
      model: this.config.model,
      messages,
      temperature: options?.temperature ?? this.config.temperature,
      max_completion_tokens:
        options?.maxCompletionTokens ?? this.config.maxCompletionTokens,
    };

    let data: GroqCompletionResponse;
    try {
      const response = await firstValueFrom(
        this.httpService.post<GroqCompletionResponse>(url, body, {
          headers: {
            Authorization: `Bearer ${this.config.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      data = response.data;
    } catch (error) {
      // Log status only — never the request body or API key.
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      this.logger.error(`Groq request failed (status: ${status ?? 'unknown'})`);
      throw new ChatProviderError();
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      this.logger.error('Groq response contained no completion content');
      throw new ChatProviderError('Chat provider returned an empty completion');
    }

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
