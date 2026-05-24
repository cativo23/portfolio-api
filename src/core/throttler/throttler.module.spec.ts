import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerModule } from './throttler.module';
import { loadThrottlerConfig } from '@config/configuration.loaders';

describe('AppThrottlerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppThrottlerModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export ThrottlerModule', () => {
    const throttlerModule = module.get(ThrottlerModule);
    expect(throttlerModule).toBeDefined();
  });
});

describe('loadThrottlerConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should return defaults when env vars are unset', () => {
    delete process.env.THROTTLE_TTL;
    delete process.env.THROTTLE_LIMIT;

    const config = loadThrottlerConfig();

    expect(config.ttl).toBe(60);
    expect(config.limit).toBe(100);
  });

  it('should read values from env vars', () => {
    process.env.THROTTLE_TTL = '120';
    process.env.THROTTLE_LIMIT = '200';

    const config = loadThrottlerConfig();

    expect(config.ttl).toBe(120);
    expect(config.limit).toBe(200);
  });
});
