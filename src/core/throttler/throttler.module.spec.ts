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
    delete process.env.THROTTLE_PUBLIC_LIMIT;
    delete process.env.THROTTLE_STRICT_LIMIT;

    const config = loadThrottlerConfig();

    expect(config.ttl).toBe(60);
    expect(config.limit).toBe(100);
    expect(config.publicLimit).toBe(10);
    expect(config.strictLimit).toBe(5);
  });

  it('should read values from env vars', () => {
    process.env.THROTTLE_TTL = '120';
    process.env.THROTTLE_LIMIT = '200';
    process.env.THROTTLE_PUBLIC_LIMIT = '20';
    process.env.THROTTLE_STRICT_LIMIT = '3';

    const config = loadThrottlerConfig();

    expect(config.ttl).toBe(120);
    expect(config.limit).toBe(200);
    expect(config.publicLimit).toBe(20);
    expect(config.strictLimit).toBe(3);
  });

  it('should use seconds unit for ttl (not milliseconds)', () => {
    // NestJS throttler v6+ uses seconds — a reasonable default is 60s, not 60000ms
    const config = loadThrottlerConfig();

    expect(config.ttl).toBeLessThan(1000); // sanity: seconds, not milliseconds
  });
});
