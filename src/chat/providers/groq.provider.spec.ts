import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { vi } from 'vitest';
import { GroqChatProvider } from './groq.provider';
import { ChatProviderError } from './chat-provider.error';
import type { ChatConfig } from '@config/chat.config';
import type { ChatMessage } from './chat-provider.interface';

const CHAT_CONFIG: ChatConfig = {
  groqApiKey: 'gsk_test_key',
  groqBaseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.1-8b-instant',
  temperature: 0.3,
  maxCompletionTokens: 512,
  cacheTtlSeconds: 86400,
};

const MESSAGES: ChatMessage[] = [
  { role: 'system', content: 'You only answer about Carlos.' },
  { role: 'user', content: 'What is your main stack?' },
];

const GROQ_OK_RESPONSE = {
  data: {
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        message: { role: 'assistant', content: 'Laravel, NestJS and FastAPI.' },
      },
    ],
    usage: { prompt_tokens: 20, completion_tokens: 8, total_tokens: 28 },
  },
};

describe('GroqChatProvider', () => {
  let provider: GroqChatProvider;
  const mockHttp = { post: vi.fn() };
  const mockConfig = { getOrThrow: vi.fn() };

  beforeEach(async () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(vi.fn());
    mockConfig.getOrThrow.mockReturnValue(CHAT_CONFIG);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqChatProvider,
        { provide: HttpService, useValue: mockHttp },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    provider = module.get<GroqChatProvider>(GroqChatProvider);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs to the Groq chat completions endpoint with auth header and config-driven body', async () => {
    mockHttp.post.mockReturnValue(of(GROQ_OK_RESPONSE));

    await provider.complete(MESSAGES);

    expect(mockHttp.post).toHaveBeenCalledTimes(1);
    const [url, body, options] = mockHttp.post.mock.calls[0];

    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(body).toMatchObject({
      model: 'llama-3.1-8b-instant',
      messages: MESSAGES,
      temperature: 0.3,
      max_completion_tokens: 512,
    });
    // Groq uses max_completion_tokens, NOT OpenAI's max_tokens
    expect(body).not.toHaveProperty('max_tokens');
    expect(options.headers.Authorization).toBe('Bearer gsk_test_key');
  });

  it('maps the Groq response to a ChatCompletionResult (content + usage)', async () => {
    mockHttp.post.mockReturnValue(of(GROQ_OK_RESPONSE));

    const result = await provider.complete(MESSAGES);

    expect(result.content).toBe('Laravel, NestJS and FastAPI.');
    expect(result.usage).toEqual({
      promptTokens: 20,
      completionTokens: 8,
      totalTokens: 28,
    });
  });

  it('allows per-call overrides of temperature and maxCompletionTokens', async () => {
    mockHttp.post.mockReturnValue(of(GROQ_OK_RESPONSE));

    await provider.complete(MESSAGES, {
      temperature: 0.9,
      maxCompletionTokens: 128,
    });

    const [, body] = mockHttp.post.mock.calls[0];
    expect(body.temperature).toBe(0.9);
    expect(body.max_completion_tokens).toBe(128);
  });

  it('throws a ChatProviderError (no vendor internals leaked) when Groq responds with an error', async () => {
    const axiosError = new AxiosError('Request failed with status code 401');
    axiosError.response = {
      status: 401,
      data: { error: { message: 'Invalid API Key' } },
    } as never;
    mockHttp.post.mockReturnValue(throwError(() => axiosError));

    await expect(provider.complete(MESSAGES)).rejects.toBeInstanceOf(
      ChatProviderError,
    );
  });

  it('throws a ChatProviderError when the response has no choices', async () => {
    mockHttp.post.mockReturnValue(of({ data: { choices: [] } }));

    await expect(provider.complete(MESSAGES)).rejects.toBeInstanceOf(
      ChatProviderError,
    );
  });
});
