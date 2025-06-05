import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner, Logger as TypeOrmLogger } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Custom TypeORM logger that integrates with NestJS logger
 * Provides detailed logging for database operations
 */
@Injectable() 
export class TypeOrmLoggerService implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM');
  private readonly logLevels: string[];

  constructor(private readonly configService: ConfigService) {
    // Get log levels from environment variables or use default
    this.logLevels = (
      this.configService.get<string>('DB_LOG_LEVELS') || 'error,warn,schema'
    )
      .split(',')
      .map((level) => level.trim());
  }

  /**
   * Log query and parameters
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
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
    queryRunner?: QueryRunner,
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
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): void {
    if (this.shouldLog('warn')) {
      const sql = this.buildSqlString(query, parameters);
      this.logger.warn(`Slow Query (${time}ms): ${sql}`);
    }
  }

  /**
   * Log schema build messages
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    if (this.shouldLog('schema')) {
      this.logger.log(`Schema: ${message}`);
    }
  }

  /**
   * Log migration messages
   */
  logMigration(message: string, queryRunner?: QueryRunner): void {
    if (this.shouldLog('migration')) {
      this.logger.log(`Migration: ${message}`);
    }
  }

  /**
   * Log general messages
   */
  log(
    level: 'log' | 'info' | 'warn' | 'error',
    message: any,
    queryRunner?: QueryRunner,
  ): void {
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
   * Build SQL string with parameters for logging
   */
  private buildSqlString(query: string, parameters?: any[]): string {
    if (!parameters || !parameters.length) {
      return query;
    }

    // Simple parameter replacement for logging
    let sql = query;
    try {
      if (parameters && parameters.length) {
        // Replace ? with parameter values
        if (sql.includes('?')) {
          parameters.forEach((param) => {
            sql = sql.replace('?', this.stringifyParameter(param));
          });
        }
        // For named parameters
        else {
          Object.keys(parameters[0]).forEach((key) => {
            sql = sql.replace(
              new RegExp(`:${key}\\b`, 'g'),
              this.stringifyParameter(parameters[0][key]),
            );
          });
        }
      }
    } catch (error) {
      // If parameter replacement fails, return original query with parameters
      return `${query} -- Parameters: ${JSON.stringify(parameters)}`;
    }

    return sql;
  }

  /**
   * Convert parameter to string for logging
   */
  private stringifyParameter(param: any): string {
    if (param === null || param === undefined) {
      return 'NULL';
    } else if (typeof param === 'string') {
      return `'${param.replace(/'/g, "''")}'`;
    } else if (param instanceof Date) {
      return `'${param.toISOString()}'`;
    } else if (Array.isArray(param)) {
      return `[${param.map((p) => this.stringifyParameter(p)).join(', ')}]`;
    } else if (typeof param === 'object') {
      return JSON.stringify(param);
    }
    return String(param);
  }
}
