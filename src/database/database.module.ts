import { Global, Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionService } from './transaction/transaction.service';
import { ConnectionRetryService } from './connection/connection-retry.service';
import { TypeOrmLoggerService } from './logger/typeorm-logger.service';
import { createTypeOrmOptions } from '@config/typeorm-common.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
        loggerService: TypeOrmLoggerService,
      ): Promise<TypeOrmModuleOptions> => {
        // Use common TypeORM configuration
        const config: TypeOrmModuleOptions = {
          ...createTypeOrmOptions(configService, loggerService),
          // Add application-specific options
          autoLoadEntities: true,
        };

        Logger.log('Database configuration loadd', 'DatabaseModule');
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
