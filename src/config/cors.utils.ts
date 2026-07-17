import type { AppConfig } from '@config/configuration.types';

const DEV_LOCALHOST_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4173',
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
];

/**
 * Builds the CORS allowlist for the current environment.
 * In development, common localhost dev-server ports are appended.
 * In all other environments, only the configured origins are used.
 */
export function buildCorsAllowlist(appConfig: AppConfig): string[] {
  if (appConfig.nodeEnv === 'development') {
    const combined = new Set([
      ...appConfig.corsOrigins,
      ...DEV_LOCALHOST_ORIGINS,
    ]);
    return Array.from(combined);
  }
  return appConfig.corsOrigins;
}

/**
 * Returns true if the request origin should be allowed.
 * Blank origin (no Origin header) is allowed for non-browser callers.
 */
export function isOriginAllowed(
  origin: string | undefined,
  allowlist: string[],
): boolean {
  if (!origin) return true;
  return allowlist.includes(origin);
}
