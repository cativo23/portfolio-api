import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Base seeder class that provides common functionality for all seeders
 */
export abstract class BaseSeeder {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Constructor for the base seeder
   * @param dataSource TypeORM data source for database operations
   */
  constructor(protected readonly dataSource: DataSource) {}

  /**
   * Abstract method that must be implemented by all seeders
   * This method contains the seeding logic
   */
  public abstract seed(): Promise<void>;

  /**
   * Clears the data from the specified entity table
   * @param entityName The name of the entity to clear
   */
  protected async clear(entityName: string): Promise<void> {
    this.logger.log(`Clearing ${entityName} table...`);
    const repository = this.dataSource.getRepository(entityName);
    await repository.clear();
    this.logger.log(`${entityName} table cleared`);
  }

  /**
   * Executes the seeder with proper error handling
   */
  public async execute(): Promise<void> {
    try {
      this.logger.log(`Starting ${this.constructor.name}...`);
      await this.seed();
      this.logger.log(`${this.constructor.name} completed successfully`);
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}: ${error.message}`);
      throw error;
    }
  }
}
