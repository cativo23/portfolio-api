import { registerAs } from '@nestjs/config';

export interface ApiKeyConfig {
  secret: string;
}

/**
 * HMAC secret for hashing API keys at rest. Required at application startup.
 * Rotating this value invalidates all existing API keys.
 */
export default registerAs('apiKey', (): ApiKeyConfig => {
  console.log('[API Key Config Loader] process.env.API_KEY_SECRET:', process.env.API_KEY_SECRET ? '***' + process.env.API_KEY_SECRET.slice(-4) : '(undefined)');
  const secret = process.env.API_KEY_SECRET?.trim();
  console.log('[API Key Config Loader] loaded secret:', secret ? '***' + secret.slice(-4) : '(empty)');
  if (!secret) {
    throw new Error(
      'API_KEY_SECRET environment variable is required but not set',
    );
  }
  return { secret };
});
