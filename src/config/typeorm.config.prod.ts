import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { createTypeOrmOptions } from './typeorm-common.config';
import { loadDatabaseConfig } from './configuration.loaders';

config();

const db = loadDatabaseConfig();

export default new DataSource({
  ...(createTypeOrmOptions(db) as DataSourceOptions),
  entities: [__dirname + '/../**/*.entity.js'],
  migrations: [__dirname + '/../database/migrations/*-migration.js'],
  migrationsRun: false,
  logging: true,
} as DataSourceOptions);
