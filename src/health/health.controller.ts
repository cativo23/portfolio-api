import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }
}
