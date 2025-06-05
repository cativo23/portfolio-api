import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createTypeOrmOptions } from './typeorm-common.config';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const configService = new ConfigService();

// Use common TypeORM configuration with migration-specific options
const AppDataSource = new DataSource({
  ...(createTypeOrmOptions(configService) as DataSourceOptions),
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
});

export default AppDataSource;
