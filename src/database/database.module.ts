import { Global, Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionService } from './transaction/transaction.service';
import { ConnectionRetryService } from './connection/connection-retry.service';
import { TypeOrmLoggerService } from './logger/typeorm-logger.service';
import { createTypeOrmOptions } from '@config/typeorm-common.config';
import type { DatabaseConfig } from '@config/configuration.types';

@Global()
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      extraProviders: [TypeOrmLoggerService],
      useFactory: async (
        configService: ConfigService,
        loggerService: TypeOrmLoggerService,
      ): Promise<TypeOrmModuleOptions> => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        const config: TypeOrmModuleOptions = {
          ...createTypeOrmOptions(db, loggerService),
          // Add application-specific options
          autoLoadEntities: true,
        };

        Logger.log('Database configuration loaded', 'DatabaseModule');
        return config;
      },
      inject: [ConfigService, TypeOrmLoggerService],
    }),
  ],
  providers: [TransactionService, ConnectionRetryService, TypeOrmLoggerService],
  exports: [TransactionService, ConnectionRetryService, TypeOrmLoggerService],
})
export class DatabaseModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    private readonly connectionRetryService: ConnectionRetryService,
  ) {}

  /**
   * Verify database connection on application startup
   */
  async onApplicationBootstrap() {
    try {
      await this.connectionRetryService.connect();
      this.logger.log('Database connection verified on application startup');
    } catch (error) {
      this.logger.error(
        `Failed to verify database connection: ${error.message}`,
      );
    }
  }
}
