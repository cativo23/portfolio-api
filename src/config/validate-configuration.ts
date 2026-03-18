import { trimEnvQuotes } from '@config/env.utils';

interface ValidationRule {
  condition: boolean;
  message: string;
}

/**
 * Validates configuration in production environments.
 * Falls back to process.env when config namespaces are not available.
 * - In `test` mode: skips all checks (Jest doesn't need real secrets).
 * - In `production`: throws on missing required vars.
 * - In `development`: logs warnings but doesn't throw.
 */
export function validateConfiguration(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = trimEnvQuotes(process.env.NODE_ENV) || 'development';

  if (nodeEnv === 'test') {
    return config;
  }

  // Try to get config from namespaces first, fall back to process.env
  const db = config.database as { host?: string; username?: string; database?: string } | undefined;
  const jwt = config.jwt as { secret?: string } | undefined;
  const redis = config.redis as { host?: string } | undefined;
  const apiKey = config.apiKey as { secret?: string } | undefined;

  // Build validation rules using config namespaces or process.env as fallback
  const rules: ValidationRule[] = [
    {
      condition: !(jwt?.secret?.length || trimEnvQuotes(process.env.JWT_SECRET)),
      message: 'JWT_SECRET is required',
    },
    {
      condition: !(db?.host?.length || trimEnvQuotes(process.env.DB_HOST)),
      message: 'DB_HOST is required',
    },
    {
      condition: !(db?.username?.length || trimEnvQuotes(process.env.DB_USERNAME)),
      message: 'DB_USERNAME is required',
    },
    {
      condition: !(db?.database?.length || trimEnvQuotes(process.env.DB_NAME)),
      message: 'DB_NAME is required',
    },
    {
      condition: !(redis?.host?.length || trimEnvQuotes(process.env.REDIS_HOST)),
      message: 'REDIS_HOST is required',
    },
    {
      condition: !(apiKey?.secret?.length || trimEnvQuotes(process.env.API_KEY_SECRET)),
      message: 'API_KEY_SECRET is required',
    },
  ];

  const errors = rules.filter((r) => r.condition).map((r) => r.message);

  if (errors.length > 0) {
    if (nodeEnv === 'production') {
      throw new Error(
        `Configuration errors:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
      );
    }
    // Development: warn but don't crash
    for (const error of errors) {
      console.warn(`[Config Warning] ${error}`);
    }
  }

  return config;
}
