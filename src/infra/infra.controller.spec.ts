import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InfraController } from './infra.controller';
import { InfraService } from './infra.service';

const mockInfraService = {
  getStats: vi.fn(),
};

const mockCacheManager = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  stores: [],
};

describe('InfraController', () => {
  let controller: InfraController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfraController],
      providers: [
        { provide: InfraService, useValue: mockInfraService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<InfraController>(InfraController);
  });

  it('returns the stats from the service', async () => {
    mockInfraService.getStats.mockResolvedValue({ containers: 20, stacks: 12 });

    await expect(controller.stats()).resolves.toEqual({
      containers: 20,
      stacks: 12,
    });
    expect(mockInfraService.getStats).toHaveBeenCalledTimes(1);
  });
});
