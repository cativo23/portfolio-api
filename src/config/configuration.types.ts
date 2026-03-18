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
