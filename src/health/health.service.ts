import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface HealthComponentStatus {
  status: 'up' | 'down';
  message?: string;
  latency?: number;
}

export interface MemoryStats {
  status: 'up' | 'down';
  used: number;
  total: number;
  usagePercent: number;
  message?: string;
}

export interface DiskStats {
  status: 'up' | 'down';
  used: number;
  total: number;
  usagePercent: number;
  message?: string;
}

@Injectable()
export class HealthService {
  private readonly startTime: number;
  private readonly version: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || 'development';
  }

  /**
   * Get application uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Check database connection health
   */
  async checkDatabase(): Promise<HealthComponentStatus> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency,
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Redis connection health
   */
  async checkRedis(): Promise<HealthComponentStatus> {
    const startTime = Date.now();
    try {
      await this.cacheManager.get('health_ping');
      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency,
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check memory usage health
   */
  checkMemory(): MemoryStats {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    const usagePercent = (used / total) * 100;

    // Consider unhealthy if using more than 90% of heap
    const status: 'up' | 'down' = usagePercent > 90 ? 'down' : 'up';

    return {
      status,
      used,
      total,
      usagePercent,
      message:
        status === 'down'
          ? `Memory usage critical: ${usagePercent.toFixed(1)}%`
          : undefined,
    };
  }

  /**
   * Check disk usage health
   */
  async checkDisk(): Promise<DiskStats> {
    try {
      const fs = await import('fs/promises');
      const stat = await fs.statfs('/');
      const total = stat.bsize * stat.blocks;
      const free = stat.bsize * stat.bfree;
      const used = total - free;
      const usagePercent = (used / total) * 100;

      // Consider unhealthy if using more than 85% of disk
      const status: 'up' | 'down' = usagePercent > 85 ? 'down' : 'up';

      return {
        status,
        used,
        total,
        usagePercent,
        message:
          status === 'down'
            ? `Disk usage critical: ${usagePercent.toFixed(1)}%`
            : undefined,
      };
    } catch {
      return {
        status: 'up',
        used: 0,
        total: 0,
        usagePercent: 0,
        message: 'Disk stats unavailable (running in container?)',
      };
    }
  }

  /**
   * Get full health status
   */
  async getFullHealth() {
    const [database, redis, memory, disk] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      Promise.resolve(this.checkMemory()),
      this.checkDisk(),
    ]);

    const allComponents = { database, redis, memory, disk };
    const allHealthy = Object.values(allComponents).every(
      (c) => c.status === 'up',
    );
    const someHealthy = Object.values(allComponents).some(
      (c) => c.status === 'up',
    );

    const status: 'ok' | 'degraded' | 'error' = allHealthy
      ? 'ok'
      : someHealthy
        ? 'degraded'
        : 'error';

    // Get process resource usage (excluding sensitive identifiers)
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status,
      version: this.version,
      environment: this.configService.get('app.nodeEnv', 'production'),
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      process: {
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
      },
      components: {
        database,
        redis,
        memory,
        disk,
      },
    };
  }

  /**
   * Get liveness status (is the process alive?)
   */
  getLiveness() {
    return {
      status: 'alive' as const,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
    };
  }

  /**
   * Get readiness status (are dependencies ready?)
   */
  async getReadiness() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const notReady: string[] = [];
    if (database.status === 'down') notReady.push('database');
    if (redis.status === 'down') notReady.push('redis');

    return {
      status: notReady.length === 0 ? ('ready' as const) : ('not_ready' as const),
      timestamp: new Date().toISOString(),
      ...(notReady.length > 0 && { notReadyDependencies: notReady }),
    };
  }
}
