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

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
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
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    diskHealthIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check results', async () => {
    const healthCheckResult: HealthCheckResult = {
      status: 'ok',
      info: {
        'nestjs-docs': { status: 'up' },
        storage: { status: 'up' },
      },
      error: {},
      details: {
        'nestjs-docs': { status: 'up' },
        storage: { status: 'up' },
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
    jest
      .spyOn(healthCheckService, 'check')
      .mockReturnValue(Promise.resolve(healthCheckResult));

    jest.spyOn(typeOrmHealthIndicator, 'pingCheck').mockReturnValue(
      Promise.resolve({ database: { status: 'up' } } as HealthIndicatorResult),
    );

    const result = await controller.check();
    expect(result).toEqual(healthCheckResult);
  });
});
