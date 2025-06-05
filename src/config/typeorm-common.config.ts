import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import { LogLevel } from 'typeorm';

/**
 * Creates common TypeORM configuration options that can be used by both
 * the application and migrations
 *
 * @param configService The NestJS ConfigService
 * @param logger Optional custom logger for TypeORM
 * @returns TypeORM configuration options
 */
export function createTypeOrmOptions(
  configService: ConfigService,
  logger?: any,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    // Connection pool configuration
    poolSize: configService.get<number>('DB_POOL_SIZE') || 10,
    connectTimeout: configService.get<number>('DB_CONNECT_TIMEOUT') || 10000,
    extra: {
      connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT') || 10,
      queueLimit: configService.get<number>('DB_QUEUE_LIMIT') || 0,
      waitForConnections: true,
    },
    // Retry connection on failure
    retryAttempts: configService.get<number>('DB_MAX_RETRIES') || 5,
    retryDelay: configService.get<number>('DB_RETRY_DELAY') || 5000,
    // SSL configuration
    ssl: configService.get<boolean>('DB_SSL_ENABLED')
      ? {
          rejectUnauthorized:
            configService.get<boolean>('DB_SSL_REJECT_UNAUTHORIZED') !== false,
          ca: configService.get<string>('DB_SSL_CA')
            ? fs.readFileSync(configService.get<string>('DB_SSL_CA')).toString()
            : undefined,
          key: configService.get<string>('DB_SSL_KEY')
            ? fs
                .readFileSync(configService.get<string>('DB_SSL_KEY'))
                .toString()
            : undefined,
          cert: configService.get<string>('DB_SSL_CERT')
            ? fs
                .readFileSync(configService.get<string>('DB_SSL_CERT'))
                .toString()
            : undefined,
        }
      : undefined,
    // Custom logger if provided
    logger: logger,
    // Configure logging levels
    logging: configService.get<string>('DB_LOG_LEVELS')
      ? (configService
          .get<string>('DB_LOG_LEVELS')
          .split(',')
          .map((level) => level.trim()) as LogLevel[])
      : ['error', 'warn', 'schema'],
    // Query caching configuration
    cache: configService.get<boolean>('DB_CACHE_ENABLED')
      ? {
          type: 'database',
          duration: configService.get<number>('DB_CACHE_DURATION') || 60000, // 1 minute default
          alwaysEnabled:
            configService.get<boolean>('DB_CACHE_ALWAYS_ENABLED') || false,
          ignoreErrors: true,
        }
      : false,
  };
}
