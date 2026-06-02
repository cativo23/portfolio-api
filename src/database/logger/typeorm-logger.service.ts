import { Injectable, Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { DatabaseConfig } from '@config/configuration.types';

/**
 * Custom TypeORM logger that integrates with NestJS logger
 * Provides detailed logging for database operations
 */
@Injectable()
export class TypeOrmLoggerService implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM');
  private readonly logLevels: string[];

  constructor(private readonly configService: ConfigService) {
    const db = this.configService.getOrThrow<DatabaseConfig>('database');
    this.logLevels = db.logLevels.map((l) => String(l));
  }

  /**
   * Log query and parameters
   */
  logQuery(query: string, parameters?: any[]): void {
    if (this.shouldLog('query')) {
      const sql = this.buildSqlString(query, parameters);
      this.logger.log(`Query: ${sql}`);
    }
  }

  /**
   * Log query that failed
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
  ): void {
    if (this.shouldLog('error')) {
      const sql = this.buildSqlString(query, parameters);
      this.logger.error(`Query Error: ${sql}`);
      if (error instanceof Error) {
        this.logger.error(`Error: ${error.message}`);
        this.logger.error(error.stack);
      } else {
        this.logger.error(`Error: ${error}`);
      }
    }
  }

  /**
   * Log query that is slow
   */
  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    if (this.shouldLog('warn')) {
      const sql = this.buildSqlString(query, parameters);
      this.logger.warn(`Slow Query (${time}ms): ${sql}`);
    }
  }

  /**
   * Log schema build messages
   */
  logSchemaBuild(message: string): void {
    if (this.shouldLog('schema')) {
      this.logger.log(`Schema: ${message}`);
    }
  }

  /**
   * Log migration messages
   */
  logMigration(message: string): void {
    if (this.shouldLog('migration')) {
      this.logger.log(`Migration: ${message}`);
    }
  }

  /**
   * Log general messages
   */
  log(level: 'log' | 'info' | 'warn' | 'error', message: any): void {
    switch (level) {
      case 'log':
      case 'info':
        if (this.shouldLog('info')) {
          this.logger.log(message);
        }
        break;
      case 'warn':
        if (this.shouldLog('warn')) {
          this.logger.warn(message);
        }
        break;
      case 'error':
        if (this.shouldLog('error')) {
          this.logger.error(message);
        }
        break;
    }
  }

  /**
   * Check if the specified log level should be logged
   */
  private shouldLog(level: string): boolean {
    return this.logLevels.includes(level) || this.logLevels.includes('all');
  }

  /**
   * Build the SQL string for logging.
   *
   * Security: bound parameter values are NEVER interpolated into the logged
   * string — they can contain plaintext passwords or PII that would then leak
   * into container logs / the logging stack. The parameterized query (with its
   * placeholders) is logged as-is, with only a redacted parameter count.
   */
  private buildSqlString(query: string, parameters?: any[]): string {
    if (!parameters || !parameters.length) {
      return query;
    }
    return `${query} -- [${parameters.length} parameter(s) redacted]`;
  }
}
