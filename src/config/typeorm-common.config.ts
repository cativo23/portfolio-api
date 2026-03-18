import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import type { DatabaseConfig } from '@config/configuration.types';

/**
 * TypeORM options compartidas (app + CLI migrations).
 */
export function createTypeOrmOptions(
  db: DatabaseConfig,
  logger?: unknown,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    poolSize: db.poolSize,
    connectTimeout: db.connectTimeout,
    extra: {
      connectionLimit: db.connectionLimit,
      queueLimit: db.queueLimit,
      waitForConnections: true,
    },
    retryAttempts: db.maxRetries,
    retryDelay: db.retryDelay,
    ssl: db.sslEnabled
      ? {
          rejectUnauthorized: db.sslRejectUnauthorized,
          ca: db.sslCaPath
            ? fs.readFileSync(db.sslCaPath).toString()
            : undefined,
          key: db.sslKeyPath
            ? fs.readFileSync(db.sslKeyPath).toString()
            : undefined,
          cert: db.sslCertPath
            ? fs.readFileSync(db.sslCertPath).toString()
            : undefined,
        }
      : undefined,
    logger: logger as TypeOrmModuleOptions['logger'],
    logging: db.logLevels,
    cache: db.cacheEnabled
      ? {
          type: 'database',
          duration: db.cacheDurationMs,
          alwaysEnabled: db.cacheAlwaysEnabled,
          ignoreErrors: true,
        }
      : false,
  };
}
