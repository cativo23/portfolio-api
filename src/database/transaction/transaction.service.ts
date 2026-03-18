import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

/**
 * Service for managing database transactions
 * Provides methods to execute operations within a transaction
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Executes a callback within a transaction
   * If the callback throws an error, the transaction is rolled back
   * If the callback completes successfully, the transaction is committed
   *
   * @param callback Function to execute within the transaction
   * @returns The result of the callback
   */
  async executeInTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug('Transaction started');
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed');
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`);
      await queryRunner.rollbackTransaction();
      this.logger.debug('Transaction rolled back');
      throw error;
    } finally {
      await queryRunner.release();
      this.logger.debug('Query runner released');
    }
  }

  /**
   * Executes a callback with a provided query runner
   * This is useful when you need more control over the transaction
   *
   * @param callback Function to execute with the query runner
   * @returns The result of the callback
   */
  async executeWithQueryRunner<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      return await callback(queryRunner);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Gets the current transaction manager or creates a new one
   * This is useful when you need to access the entity manager in a service
   *
   * @returns An entity manager
   */
  getManager(): EntityManager {
    return this.dataSource.manager;
  }
}
