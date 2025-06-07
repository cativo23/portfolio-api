import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheckResult,
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
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  /**
   * Performs health checks on various components of the application
   *
   * Checks the connectivity to NestJS documentation site, disk storage availability,
   * and database connection health
   *
   * @returns Health check results for each component
   */
  @Get()
  @HealthCheck()
  async check(): Promise<{
    summary: string;
    checks: Record<string, any>;
    checkedAt: string;
  }> {
    const result: HealthCheckResult = await this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.80,
        }),
      () => this.db.pingCheck('database'),
    ]);

    return {
      summary: Object.entries(result.info)
        .map(([key, val]) => `${key}: ${val.status}`)
        .join(', '),
      checks: result.info,
      checkedAt: new Date().toISOString(),
    };
  }
}
