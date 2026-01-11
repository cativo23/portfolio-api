import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerModule } from './throttler.module';

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
