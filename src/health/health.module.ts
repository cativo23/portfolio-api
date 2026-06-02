import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from '@health/health.controller';
import { HealthService } from '@health/health.service';
import { ApiKeyModule } from '@core/api-key.module';
import { ApiKeyGuard } from '@core/api-key.guard';

@Module({
  imports: [TerminusModule, HttpModule, ApiKeyModule],
  controllers: [HealthController],
  providers: [HealthService, ApiKeyGuard],
  exports: [HealthService],
})
export class HealthModule {}
