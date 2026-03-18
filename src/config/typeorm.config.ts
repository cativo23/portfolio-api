import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { createTypeOrmOptions } from './typeorm-common.config';
import { loadDatabaseConfig } from './configuration.loaders';

config();

const db = loadDatabaseConfig();

const AppDataSource = new DataSource({
  ...(createTypeOrmOptions(db) as DataSourceOptions),
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: false,
});

export default AppDataSource;
