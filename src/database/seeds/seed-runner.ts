import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { ProjectSeeder } from './project.seeder';
import AppDataSource from '@config/typeorm.config';

/**
 * Seeder runner class that executes all seeders in the correct order
 */
export class SeedRunner {
  private readonly logger = new Logger('SeedRunner');
  private readonly dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Initializes the database connection
   */
  private async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      this.logger.log('Initializing database connection...');
      await this.dataSource.initialize();
      this.logger.log('Database connection initialized');
    }
  }

  /**
   * Closes the database connection
   */
  private async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      this.logger.log('Closing database connection...');
      await this.dataSource.destroy();
      this.logger.log('Database connection closed');
    }
  }

  /**
   * Runs all seeders in the correct order
   */
  public async run(): Promise<void> {
    try {
      await this.initialize();

      // Run seeders in order
      this.logger.log('Starting database seeding...');

      // 1. Seed users
      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.execute();

      // 2. Seed projects
      const projectSeeder = new ProjectSeeder(this.dataSource);
      await projectSeeder.execute();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error(`Error during database seeding: ${error.message}`);
      throw error;
    } finally {
      await this.close();
    }
  }
}

/**
 * Main function to run the seeders
 */
async function runSeeders(): Promise<void> {
  const seedRunner = new SeedRunner();
  try {
    await seedRunner.run();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}
