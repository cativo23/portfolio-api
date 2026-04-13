import { vi, type Mock, type SpyInstance, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheInvalidationService } from './cache-invalidation.service';
import { Logger } from '@nestjs/common';

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;
  let mockRedisClient: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockRedisClient = {
      scanIterator: vi.fn(),
      del: vi.fn(),
    };

    mockCacheManager = {
      stores: [
        {
          store: {
            _cache: {
              client: mockRedisClient,
            },
          },
        },
      ],
    };

    vi.spyOn(Logger.prototype, 'log').mockImplementation(vi.fn());
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(vi.fn());
    vi.spyOn(Logger.prototype, 'error').mockImplementation(vi.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInvalidationService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CacheInvalidationService>(CacheInvalidationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidateByPrefix', () => {
    it('should delete all keys matching the prefix', async () => {
      const keys = ['projects:/projects?page=1', 'projects:/projects/5'];
      mockRedisClient.scanIterator.mockReturnValue(
        (async function* () {
          for (const key of keys) yield key;
        })(),
      );
      mockRedisClient.del.mockResolvedValue(2);

      await service.invalidateByPrefix('projects');

      expect(mockRedisClient.scanIterator).toHaveBeenCalledWith({
        MATCH: 'projects:*',
        COUNT: 100,
      });
      expect(mockRedisClient.del).toHaveBeenCalledWith(keys);
    });

    it('should not call del when no keys match', async () => {
      mockRedisClient.scanIterator.mockReturnValue((async function* () {})());

      await service.invalidateByPrefix('projects');

      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should log error and not throw when scanIterator fails', async () => {
      mockRedisClient.scanIterator.mockImplementation(() => {
        throw new Error('Redis connection refused');
      });

      await expect(
        service.invalidateByPrefix('projects'),
      ).resolves.not.toThrow();
    });

    it('should log error and not throw when del fails', async () => {
      const keys = ['projects:/projects?page=1'];
      mockRedisClient.scanIterator.mockReturnValue(
        (async function* () {
          for (const key of keys) yield key;
        })(),
      );
      mockRedisClient.del.mockRejectedValue(new Error('DEL failed'));

      await expect(
        service.invalidateByPrefix('projects'),
      ).resolves.not.toThrow();
    });
  });
});
