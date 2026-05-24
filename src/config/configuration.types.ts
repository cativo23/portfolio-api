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
  /** Window duration in seconds (NestJS throttler v6+ uses seconds, not milliseconds) */
  ttl: number;
  /** Max requests per window for authenticated endpoints */
  limit: number;
  /** Max requests per window for public endpoints (e.g. contact form) */
  publicLimit: number;
  /** Max requests per window for strict endpoints (e.g. login, register) */
  strictLimit: number;
}
