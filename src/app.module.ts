import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AppConfigurationModule } from '@config/app-configuration.module';
import { RedisCacheModule } from '@src/cache/redis-cache.module';
import { HealthModule } from '@health/health.module';
import { DatabaseModule } from '@database/database.module';
import { ProjectsModule } from '@projects/projects.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { ApiKeyModule } from '@core/api-key.module';
import { ContactsModule } from '@contacts/contacts.module';
import { RequestContextModule } from '@core/context/request-context.module';
import { RequestIdMiddleware } from '@core/middleware/request-id.middleware';
import { ResponseTransformInterceptor } from '@core/interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from '@core/exceptions/global-exception.filter';
import { AppThrottlerModule } from '@core/throttler/throttler.module';

@Module({
  imports: [
    AppConfigurationModule,
    RedisCacheModule,
    RequestContextModule, // Must be imported before other modules that use it
    AppThrottlerModule, // Rate limiting - must be imported early for global guard
    HealthModule,
    DatabaseModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    ApiKeyModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Register global interceptor using APP_INTERCEPTOR token
    // This is the recommended NestJS way for global interceptors with dependencies
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    // Register global exception filter using APP_FILTER token
    // This is the recommended NestJS way for global filters with dependencies
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware to all routes
    // Note: CLS middleware is mounted in main.ts before bootstrap()
    // so RequestIdMiddleware can safely use ClsService.set()
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
