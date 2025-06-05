import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Service for handling database connection retries
 */
@Injectable()
export class ConnectionRetryService {
  private readonly logger = new Logger(ConnectionRetryService.name);
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('DB_MAX_RETRIES') || 5;
    this.retryDelay = this.configService.get<number>('DB_RETRY_DELAY') || 5000;
  }

  /**
   * Attempts to connect to the database with retry logic
   * @returns Promise resolving to true if connection is successful
   */
  async connect(): Promise<boolean> {
    this.logger.log(
      `Starting database connection with max retries: ${this.maxRetries}, retry delay: ${this.retryDelay}ms`,
    );
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        if (!this.dataSource.isInitialized) {
          this.logger.log(
            `Attempting to connect to database (attempt ${retries + 1}/${this.maxRetries})...`,
          );
          await this.dataSource.initialize();
          this.logger.log('Database connection established successfully');
          return true;
        } else {
          this.logger.log('Database connection already established');
          return true;
        }
      } catch (error) {
        retries++;
        this.logger.error(`Failed to connect to database: ${error.message}`);

        if (retries >= this.maxRetries) {
          this.logger.error(
            `Maximum retry attempts (${this.maxRetries}) reached. Giving up.`,
          );
          throw new Error(
            `Failed to connect to database after ${this.maxRetries} attempts: ${error.message}`,
          );
        }

        this.logger.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
        await this.sleep(this.retryDelay);
      }
    }

    return false;
  }

  /**
   * Utility method to sleep for a specified duration
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Checks if the database connection is healthy
   * @returns Promise resolving to true if connection is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        return false;
      }

      // Execute a simple query to check connection
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return false;
    }
  }
}
