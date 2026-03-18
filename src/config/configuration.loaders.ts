import { LogLevel } from 'typeorm';
import {
  parseEnvBoolean,
  parseEnvInt,
  trimEnvQuotes,
} from '@config/env.utils';
import type {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  RedisConfig,
} from '@config/configuration.types';

const DEFAULT_CORS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

export function loadAppConfig(): AppConfig {
  const raw = process.env.CORS_ORIGINS;
  const corsOrigins =
    raw && trimEnvQuotes(raw) !== ''
      ? raw.split(',').map((o) => trimEnvQuotes(o))
      : [...DEFAULT_CORS];

  return {
    nodeEnv: trimEnvQuotes(process.env.NODE_ENV) || 'development',
    port: parseEnvInt(process.env.PORT, 3000),
    corsOrigins,
  };
}

function parseDbLogLevels(raw: string | undefined): LogLevel[] {
  if (!raw || trimEnvQuotes(raw) === '') {
    return ['error', 'warn', 'schema'];
  }
  return trimEnvQuotes(raw)
    .split(',')
    .map((l) => l.trim()) as LogLevel[];
}

export function loadDatabaseConfig(): DatabaseConfig {
  return {
    host: trimEnvQuotes(process.env.DB_HOST) || 'localhost',
    port: parseEnvInt(process.env.DB_PORT, 3306),
    username: trimEnvQuotes(process.env.DB_USERNAME) || 'root',
    password: trimEnvQuotes(process.env.DB_PASSWORD) ?? '',
    database: trimEnvQuotes(process.env.DB_NAME) || 'portfolio',
    poolSize: parseEnvInt(process.env.DB_POOL_SIZE, 10),
    connectTimeout: parseEnvInt(process.env.DB_CONNECT_TIMEOUT, 10000),
    connectionLimit: parseEnvInt(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: parseEnvInt(process.env.DB_QUEUE_LIMIT, 0),
    maxRetries: parseEnvInt(process.env.DB_MAX_RETRIES, 5),
    retryDelay: parseEnvInt(process.env.DB_RETRY_DELAY, 5000),
    sslEnabled: parseEnvBoolean(process.env.DB_SSL_ENABLED),
    sslRejectUnauthorized:
      trimEnvQuotes(process.env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() !==
      'false',
    sslCaPath: trimEnvQuotes(process.env.DB_SSL_CA) || undefined,
    sslKeyPath: trimEnvQuotes(process.env.DB_SSL_KEY) || undefined,
    sslCertPath: trimEnvQuotes(process.env.DB_SSL_CERT) || undefined,
    logLevels: parseDbLogLevels(process.env.DB_LOG_LEVELS),
    cacheEnabled: parseEnvBoolean(process.env.DB_CACHE_ENABLED),
    cacheDurationMs: parseEnvInt(process.env.DB_CACHE_DURATION, 60000),
    cacheAlwaysEnabled: parseEnvBoolean(process.env.DB_CACHE_ALWAYS_ENABLED),
  };
}

export function loadRedisConfig(): RedisConfig {
  const password = trimEnvQuotes(process.env.REDIS_PASSWORD);
  return {
    host: trimEnvQuotes(process.env.REDIS_HOST) || 'localhost',
    port: parseEnvInt(process.env.REDIS_PORT, 6379),
    password: password || undefined,
    ttlSeconds: parseEnvInt(process.env.REDIS_TTL, 300),
  };
}

export function loadJwtConfig(): JwtConfig {
  const nodeEnv = trimEnvQuotes(process.env.NODE_ENV) || 'development';
  let secret = trimEnvQuotes(process.env.JWT_SECRET) ?? '';
  if (!secret.length && nodeEnv === 'test') {
    secret = 'test-jwt-secret';
  }
  return {
    secret,
    expiresInSeconds: parseEnvInt(process.env.JWT_EXPIRES_IN, 3600),
  };
}
