import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';
import { DetailedHealthResponseDto } from './dto/health-response.dto';

/**
 * Controller responsible for health check endpoints
 *
 * Provides endpoints for monitoring the health and status of the application
 * and its dependencies. Implements Kubernetes-style health checks:
 * - GET /health - Simplified health status (just component status)
 * - GET /health/detailed - Extended health status with metrics
 * - GET /health/live - Liveness probe (is the process alive?)
 * - GET /health/ready - Readiness probe (are dependencies ready?)
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthService: HealthService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  /**
   * Get simplified health status
   *
   * Returns basic status for each component (database, redis, memory, disk)
   * with just "up" or "down" status.
   */
  @Get()
  @SkipThrottle()
  @ApiOperation({
    summary: 'Get simplified health status',
    description:
      'Returns basic health status for all components (just up/down)',
  })
  @ApiResponse({
    status: 200,
    description: 'All components are healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more components are unhealthy',
  })
  async health() {
    const detailed = await this.healthService.getFullHealth();

    return {
      status: detailed.status,
      timestamp: detailed.timestamp,
      components: {
        database: { status: detailed.components.database.status },
        redis: { status: detailed.components.redis.status },
        memory: { status: detailed.components.memory.status },
        disk: { status: detailed.components.disk.status },
      },
    };
  }

  /**
   * Get detailed health status with extended metrics
   *
   * Includes:
   * - Database latency
   * - Redis latency
   * - Memory statistics (used, total, percentage)
   * - Disk statistics (used, total, percentage)
   * - Application uptime and version
   */
  @Get('detailed')
  @SkipThrottle()
  @ApiOperation({
    summary: 'Get detailed health status with metrics',
    description:
      'Returns extended health information including latency metrics, version, and uptime',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status retrieved successfully',
    type: DetailedHealthResponseDto,
  })
  async detailed(): Promise<DetailedHealthResponseDto> {
    return this.healthService.getFullHealth();
  }

  /**
   * Liveness probe endpoint
   *
   * Returns a simple response indicating the process is alive.
   * Does not check external dependencies.
   * Use for Kubernetes liveness probe.
   */
  @Get('live')
  @SkipThrottle()
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Simple endpoint to check if the process is alive',
  })
  @ApiResponse({
    status: 200,
    description: 'Process is alive',
  })
  async liveness(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([]);
  }

  /**
   * Readiness probe endpoint
   *
   * Checks if all critical dependencies (database, redis) are ready.
   * Returns 503 if any dependency is unavailable.
   * Use for Kubernetes readiness probe.
   */
  @Get('ready')
  @SkipThrottle()
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Check if all critical dependencies are ready to serve traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'All dependencies are ready',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more dependencies are not ready',
  })
  async readiness(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([() => this.db.pingCheck('database')]);
  }

  /**
   * Legacy health check endpoint (for backwards compatibility)
   * @deprecated Use /health or /health/detailed instead
   */
  @Get('check')
  @SkipThrottle()
  @ApiExcludeEndpoint()
  async check() {
    return this.healthService.getFullHealth();
  }
}
