import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@health/health.module';
import { DatabaseModule } from '@database/database.module';
import { ProjectsModule } from '@projects/projects.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { ApiKeyModule } from '@core/api-key.module';
import { ContactsModule } from '@contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    DatabaseModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    ApiKeyModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
