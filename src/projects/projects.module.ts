import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { AuthModule } from '@auth/auth.module';
import { ApiKeyModule } from '@core/api-key.module';
import { ApiKeyGuard } from '@core/api-key.guard';
import { JwtOrApiKeyGuard } from '@core/jwt-or-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), AuthModule, ApiKeyModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ApiKeyGuard, JwtOrApiKeyGuard],
  exports: [ApiKeyGuard, JwtOrApiKeyGuard],
})
export class ProjectsModule {}
