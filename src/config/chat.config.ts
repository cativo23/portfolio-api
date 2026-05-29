import { registerAs } from '@nestjs/config';

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
    temperature: Number(process.env.CHAT_TEMPERATURE ?? 0.3),
    maxCompletionTokens: Number(process.env.CHAT_MAX_COMPLETION_TOKENS ?? 512),
    cacheTtlSeconds: Number(process.env.CHAT_CACHE_TTL ?? 86400),
  };
});
