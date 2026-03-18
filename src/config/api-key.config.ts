import { registerAs } from '@nestjs/config';

export interface ApiKeyConfig {
  secret: string;
}

/**
 * HMAC secret for hashing API keys at rest. Required at application startup.
 * Rotating this value invalidates all existing API keys.
 */
export default registerAs('apiKey', (): ApiKeyConfig => {
  const secret = process.env.API_KEY_SECRET?.trim();
  if (!secret) {
    throw new Error(
      'API_KEY_SECRET environment variable is required but not set',
    );
  }
  return { secret };
});
