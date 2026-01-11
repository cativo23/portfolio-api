import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
} from '@nestjs/terminus';

/**
 * Controller responsible for health check endpoints
 *
 * Provides endpoints for monitoring the health and status of the application
 * and its dependencies
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  /**
   * Performs health checks on various components of the application
   *
   * Checks the connectivity to NestJS documentation site and disk storage availability
   *
   * @returns Health check results for each component
   */
  @Get()
  @SkipThrottle() // Health checks should not be rate limited (used for monitoring)
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }
}
