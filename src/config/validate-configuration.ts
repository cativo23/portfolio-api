import type { JwtConfig } from '@config/configuration.types';

/**
 * Valida la config ensamblada tras los `registerAs`.
 * En `test` no exige secretos para no romper Jest.
 */
export function validateConfiguration(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const app = config.app as { nodeEnv?: string } | undefined;
  const nodeEnv = app?.nodeEnv ?? process.env.NODE_ENV ?? 'development';

  if (nodeEnv === 'test') {
    return config;
  }

  const jwt = config.jwt as JwtConfig | undefined;
  if (nodeEnv === 'production' && !jwt?.secret?.length) {
    throw new Error('Configuration: JWT_SECRET is required in production');
  }

  const db = config.database as { host?: string } | undefined;
  if (nodeEnv === 'production' && !db?.host?.length) {
    throw new Error('Configuration: DB_HOST is required in production');
  }

  return config;
}
