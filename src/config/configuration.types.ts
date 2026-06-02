import type { LogLevel } from 'typeorm';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  poolSize: number;
  connectTimeout: number;
  connectionLimit: number;
  queueLimit: number;
  maxRetries: number;
  retryDelay: number;
  sslEnabled: boolean;
  sslRejectUnauthorized: boolean;
  sslCaPath?: string;
  sslKeyPath?: string;
  sslCertPath?: string;
  logLevels: LogLevel[];
  cacheEnabled: boolean;
  cacheDurationMs: number;
  cacheAlwaysEnabled: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  ttlSeconds: number;
}

export interface JwtConfig {
  secret: string;
  /** Segundos hasta expiración del access token */
  expiresInSeconds: number;
}

export interface ThrottlerConfig {
  /** Window duration in MILLISECONDS — the unit @nestjs/throttler v5+ expects. loadThrottlerConfig converts THROTTLE_TTL (seconds) via the seconds() helper. */
  ttl: number;
  /** Max requests per window for authenticated endpoints */
  limit: number;
}
