import { registerAs } from '@nestjs/config';

/** Parse a numeric env var, falling back when unset or non-numeric (avoids NaN). */
function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface ChatConfig {
  groqApiKey: string;
  groqBaseUrl: string;
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  cacheTtlSeconds: number;
}

export default registerAs('chat', (): ChatConfig => {
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (!groqApiKey) {
    throw new Error(
      'GROQ_API_KEY environment variable is required but not set',
    );
  }

  return {
    groqApiKey,
    groqBaseUrl:
      process.env.GROQ_BASE_URL?.trim() || 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant',
    temperature: num(process.env.CHAT_TEMPERATURE, 0.3),
    maxCompletionTokens: num(process.env.CHAT_MAX_COMPLETION_TOKENS, 512),
    cacheTtlSeconds: num(process.env.CHAT_CACHE_TTL, 86400),
  };
});
