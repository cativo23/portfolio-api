import type {
  DatabaseConfig,
  JwtConfig,
  RedisConfig,
} from '@config/configuration.types';

interface ValidationRule {
  condition: boolean;
  message: string;
}

/**
 * Validates assembled config after `registerAs` loaders.
 * - In `test` mode: skips all checks (Jest doesn't need real secrets).
 * - In `production`: throws on missing required vars.
 * - In `development`: logs warnings but doesn't throw.
 */
export function validateConfiguration(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const app = config.app as { nodeEnv?: string } | undefined;
  const nodeEnv = app?.nodeEnv ?? process.env.NODE_ENV ?? 'development';

  // Debug: log environment variables for troubleshooting
  console.log('[Config Debug] NODE_ENV:', nodeEnv);
  console.log('[Config Debug] process.env keys:', Object.keys(process.env).filter(k => k.includes('DB_') || k.includes('JWT_') || k.includes('REDIS_') || k.includes('API_KEY')).join(', '));
  console.log('[Config Debug] config keys:', Object.keys(config).join(', '));

  if (nodeEnv === 'test') {
    return config;
  }

  const db = config.database as DatabaseConfig | undefined;
  const jwt = config.jwt as JwtConfig | undefined;
  const redis = config.redis as RedisConfig | undefined;
  const apiKey = config.apiKey as { secret?: string } | undefined;

  // Debug: log loaded config values
  console.log('[Config Debug] db.host:', (db as any)?.host);
  console.log('[Config Debug] jwt.secret:', (jwt as any)?.secret);
  console.log('[Config Debug] redis.host:', (redis as any)?.host);
  console.log('[Config Debug] apiKey.secret:', (apiKey as any)?.secret);

  const rules: ValidationRule[] = [
    { condition: !jwt?.secret?.length, message: 'JWT_SECRET is required' },
    { condition: !db?.host?.length, message: 'DB_HOST is required' },
    { condition: !db?.username?.length, message: 'DB_USERNAME is required' },
    { condition: !db?.database?.length, message: 'DB_NAME is required' },
    { condition: !redis?.host?.length, message: 'REDIS_HOST is required' },
    {
      condition: !apiKey?.secret?.length,
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
