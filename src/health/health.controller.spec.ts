import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpHealthIndicator: HttpHealthIndicator;
  let diskHealthIndicator: DiskHealthIndicator;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: HealthService,
          useValue: {
            getFullHealth: jest.fn(),
            getLiveness: jest.fn(),
            getReadiness: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    diskHealthIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check results with status, timestamp, and components', async () => {
    const healthCheckResult: HealthCheckResult = {
      status: 'ok',
      info: {
        'nestjs-docs': { status: 'up' },
        storage: { status: 'up' },
        database: { status: 'up' },
      },
      error: {},
      details: {
        'nestjs-docs': { status: 'up' },
        storage: { status: 'up' },
        database: { status: 'up' },
      },
    };

    jest.spyOn(httpHealthIndicator, 'pingCheck').mockReturnValue(
      Promise.resolve({
        'nestjs-docs': { status: 'up' },
      } as HealthIndicatorResult),
    );
    jest
      .spyOn(diskHealthIndicator, 'checkStorage')
      .mockReturnValue(
        Promise.resolve({ storage: { status: 'up' } } as HealthIndicatorResult),
      );
    jest.spyOn(typeOrmHealthIndicator, 'pingCheck').mockReturnValue(
      Promise.resolve({
        database: { status: 'up' },
      } as HealthIndicatorResult),
    );
    jest
      .spyOn(healthCheckService, 'check')
      .mockReturnValue(Promise.resolve(healthCheckResult));

    const mockHealthResult = {
      status: 'ok' as const,
      version: '1.0.0',
      environment: 'test',
      timestamp: new Date().toISOString(),
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
    jest
      .spyOn(healthService, 'getFullHealth')
      .mockResolvedValue(mockHealthResult);

    const result = await controller.check();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('components');
    expect(result.status).toBe('ok');
    expect(result.components.database).toBeDefined();
    expect(result.components.redis).toBeDefined();
    expect(result.components.memory).toBeDefined();
    expect(result.components.disk).toBeDefined();
  });
});
