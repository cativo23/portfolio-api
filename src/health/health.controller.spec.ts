import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  HealthCheckResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let healthService: HealthService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: vi.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: vi.fn(),
          },
        },
        {
          provide: HealthService,
          useValue: {
            getFullHealth: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    healthService = module.get<HealthService>(HealthService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('health (GET /health)', () => {
    it('should return simplified health status', async () => {
      const mockFullHealth = {
        status: 'ok' as const,
        version: '1.0.0',
        environment: 'test',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 100,
        process: {
          cpuUsage: { user: 0, system: 0 },
          memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        },
        components: {
          database: { status: 'up' as const, latency: 10 },
          redis: { status: 'up' as const, latency: 5 },
          memory: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
          disk: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
        },
      };
      vi.spyOn(healthService, 'getFullHealth').mockResolvedValue(
        mockFullHealth,
      );

      const result = await controller.health();

      expect(result).toEqual({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        components: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory: { status: 'up' },
          disk: { status: 'up' },
        },
      });
    });

    it('should return degraded status when some components are down', async () => {
      const mockFullHealth = {
        status: 'degraded' as const,
        version: '1.0.0',
        environment: 'test',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 100,
        process: {
          cpuUsage: { user: 0, system: 0 },
          memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        },
        components: {
          database: { status: 'up' as const, latency: 10 },
          redis: { status: 'down' as const, message: 'Redis unavailable' },
          memory: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
          disk: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
        },
      };
      vi.spyOn(healthService, 'getFullHealth').mockResolvedValue(
        mockFullHealth,
      );

      const result = await controller.health();

      expect(result.status).toBe('degraded');
      expect(result.components.redis.status).toBe('down');
    });
  });

  describe('detailed (GET /health/detailed)', () => {
    it('should return detailed health status', async () => {
      const mockFullHealth = {
        status: 'ok' as const,
        version: '1.0.0',
        environment: 'test',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 100,
        process: {
          cpuUsage: { user: 0, system: 0 },
          memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        },
        components: {
          database: { status: 'up' as const, latency: 10 },
          redis: { status: 'up' as const, latency: 5 },
          memory: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
          disk: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
        },
      };
      vi.spyOn(healthService, 'getFullHealth').mockResolvedValue(
        mockFullHealth,
      );

      const result = await controller.detailed();

      expect(result).toEqual(mockFullHealth);
    });
  });

  describe('liveness (GET /health/live)', () => {
    it('should return liveness check result', async () => {
      const mockLiveness: HealthCheckResult = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };
      vi.spyOn(healthCheckService, 'check').mockResolvedValue(mockLiveness);

      const result = await controller.liveness();

      expect(result).toEqual(mockLiveness);
      expect(healthCheckService.check).toHaveBeenCalledWith([]);
    });
  });

  describe('readiness (GET /health/ready)', () => {
    it('should return readiness check result when database is ready', async () => {
      const mockReadiness: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };
      vi.spyOn(typeOrmHealthIndicator, 'pingCheck').mockResolvedValue({
        database: { status: 'up' },
      });
      vi.spyOn(healthCheckService, 'check').mockResolvedValue(mockReadiness);

      const result = await controller.readiness();

      expect(result).toEqual(mockReadiness);
    });

    it('should return service unavailable when database is not ready', async () => {
      const mockReadiness: HealthCheckResult = {
        status: 'error',
        info: {},
        error: { database: { status: 'down' } },
        details: { database: { status: 'down' } },
      };
      vi.spyOn(typeOrmHealthIndicator, 'pingCheck').mockResolvedValue({
        database: { status: 'down' },
      });
      vi.spyOn(healthCheckService, 'check').mockResolvedValue(mockReadiness);

      const result = await controller.readiness();

      expect(result.status).toBe('error');
    });
  });

  describe('check (GET /health/check) - legacy', () => {
    it('should return full health status (legacy endpoint)', async () => {
      const mockFullHealth = {
        status: 'ok' as const,
        version: '1.0.0',
        environment: 'test',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 100,
        process: {
          cpuUsage: { user: 0, system: 0 },
          memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        },
        components: {
          database: { status: 'up' as const, latency: 10 },
          redis: { status: 'up' as const, latency: 5 },
          memory: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
          disk: { status: 'up' as const, used: 0, total: 0, usagePercent: 0 },
        },
      };
      vi.spyOn(healthService, 'getFullHealth').mockResolvedValue(
        mockFullHealth,
      );

      const result = await controller.check();

      expect(result).toEqual(mockFullHealth);
    });
  });
});
