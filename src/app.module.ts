import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequestContextModule, // Must be imported before other modules that use it
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
    // This ensures every request gets a unique ID and context is set
    // Note: CLS middleware is applied first by RequestContextModule
    // RequestIdMiddleware runs after CLS middleware and populates the context
    // NestJS will resolve RequestIdMiddleware from DI (provided by RequestContextModule)
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
