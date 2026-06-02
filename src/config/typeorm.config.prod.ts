import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { createTypeOrmOptions } from './typeorm-common.config';
import { loadDatabaseConfig } from './configuration.loaders';

config();

const db = loadDatabaseConfig();

export default new DataSource({
  ...(createTypeOrmOptions(db) as DataSourceOptions),
  entities: [__dirname + '/../**/*.entity.js'],
  migrations: [__dirname + '/../database/migrations/*.js'],
  migrationsRun: false,
  // Never log every query (with bound params) in prod — keep it to errors/warns.
  logging: ['error', 'warn'],
} as DataSourceOptions);
