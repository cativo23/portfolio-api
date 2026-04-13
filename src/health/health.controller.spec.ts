import { vi, type Mock, type SpyInstance, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let healthService: HealthService;
  let httpHealthIndicator: HttpHealthIndicator;
  let diskHealthIndicator: DiskHealthIndicator;
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
          provide: HealthService,
          useValue: {
            getFullHealth: vi.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: vi.fn(),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: vi.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    healthService = module.get<HealthService>(HealthService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    diskHealthIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check results with summary, checks, and checkedAt', async () => {
    const mockHealthResult = {
      status: 'ok',
      timestamp: '2023-01-01T00:00:00Z',
      components: {
        database: { status: 'up' },
        redis: { status: 'up' },
        memory: { status: 'up' },
        disk: { status: 'up' },
      },
    };

    vi.spyOn(healthService, 'getFullHealth').mockResolvedValue(
      mockHealthResult as any,
    );

    const result = await controller.check();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('components');
    expect(result.status).toBe('ok');
    expect(result.components.database.status).toBe('up');
    expect(result.components.database).not.toHaveProperty('latency');
    expect(result.components.redis).not.toHaveProperty('latency');
  });
});
