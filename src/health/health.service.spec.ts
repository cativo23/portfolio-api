import { vi, type Mock, type SpyInstance, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HealthService } from './health.service';

const mockDataSource = {
  query: vi.fn(),
};

const mockCacheManager = {
  get: vi.fn(),
};

const mockConfigService = {
  get: vi.fn(),
};

describe('HealthService', () => {
  let service: HealthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    configService = module.get<ConfigService>(ConfigService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUptime', () => {
    it('should return uptime in seconds', () => {
      const uptime = service.getUptime();

      expect(uptime).toBeDefined();
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkDatabase', () => {
    it('should return status up when database is reachable', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ '1': 1 }]);

      const result = await service.checkDatabase();

      expect(result.status).toBe('up');
      expect(result.latency).toBeDefined();
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('should return status down when database query fails', async () => {
      mockDataSource.query.mockRejectedValueOnce(
        new Error('Connection refused'),
      );

      const result = await service.checkDatabase();

      expect(result.status).toBe('down');
      expect(result.message).toBe('Connection refused');
    });

    it('should handle unknown error type', async () => {
      mockDataSource.query.mockRejectedValueOnce('string error');

      const result = await service.checkDatabase();

      expect(result.status).toBe('down');
      expect(result.message).toBe('Unknown error');
    });
  });

  describe('checkRedis', () => {
    it('should return status up when Redis is reachable', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);

      const result = await service.checkRedis();

      expect(result.status).toBe('up');
      expect(result.latency).toBeDefined();
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('should return status down when Redis query fails', async () => {
      mockCacheManager.get.mockRejectedValueOnce(
        new Error('Redis connection error'),
      );

      const result = await service.checkRedis();

      expect(result.status).toBe('down');
      expect(result.message).toBe('Redis connection error');
    });

    it('should handle unknown error type', async () => {
      mockCacheManager.get.mockRejectedValueOnce('string error');

      const result = await service.checkRedis();

      expect(result.status).toBe('down');
      expect(result.message).toBe('Unknown error');
    });
  });

  describe('checkMemory', () => {
    it('should return memory stats with status up when usage is below 90%', async () => {
      const result = await service.checkMemory();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('usagePercent');
      expect(result.status).toBe('up');
      expect(result.usagePercent).toBeGreaterThanOrEqual(0);
      expect(result.usagePercent).toBeLessThanOrEqual(100);
    });

    it('should return status down when memory usage is above 90%', async () => {
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 950,
        heapTotal: 1000,
        heapUsed: 950,
        external: 100,
        arrayBuffers: 0,
      });

      // Mock cgroups v2 to return 1000 bytes limit
      const mockFs = {
        readFile: vi.fn().mockResolvedValue('1000'),
      };
      vi.doMock('fs/promises', () => mockFs);

      const result = await service.checkMemory();

      expect(result.status).toBe('down');
      expect(result.message).toContain('Memory usage critical');

      vi.unmock('fs/promises');
      vi.restoreAllMocks();
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('checkDisk', () => {
    it('should return disk stats with status up when usage is below 85%', async () => {
      const mockFs = {
        statfs: vi.fn().mockResolvedValue({
          bsize: 4096,
          blocks: 1000000,
          bfree: 200000,
        }),
      };

      vi.doMock('fs/promises', () => mockFs);

      const result = await service.checkDisk();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('usagePercent');

      vi.unmock('fs/promises');
    });

    it('should return status up with message when disk stats unavailable', async () => {
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 100,
        heapTotal: 1000,
        heapUsed: 50,
        external: 10,
        arrayBuffers: 0,
      });

      const mockFs = await import('fs/promises');
      const originalStatfs = mockFs.statfs;
      mockFs.statfs = vi.fn().mockRejectedValue(new Error('Not available'));

      const result = await service.checkDisk();

      expect(result.status).toBe('up');
      expect(result.message).toBe(
        'Disk stats unavailable (running in container?)',
      );

      mockFs.statfs = originalStatfs;
      vi.restoreAllMocks();
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('getFullHealth', () => {
    beforeEach(() => {
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);
      mockCacheManager.get.mockResolvedValue(null);
      vi.spyOn(configService, 'get').mockReturnValue('test');
    });

    it('should return full health status with all components', async () => {
      const result = await service.getFullHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('process');
      expect(result).toHaveProperty('components');
      expect(result.components).toHaveProperty('database');
      expect(result.components).toHaveProperty('redis');
      expect(result.components).toHaveProperty('memory');
      expect(result.components).toHaveProperty('disk');
    });

    it('should return status ok when all components are healthy', async () => {
      const result = await service.getFullHealth();

      expect(result.status).toBe('ok');
    });

    it('should return status degraded when some components are down', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB down'));

      const result = await service.getFullHealth();

      expect(result.status).toBe('degraded');
    });

    it('should return status error when all components are down', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB down'));
      mockCacheManager.get.mockRejectedValueOnce(new Error('Redis down'));

      // Mock memoryUsage to return >90% usage (down status)
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 950,
        heapTotal: 1000,
        heapUsed: 950,
        external: 100,
        arrayBuffers: 0,
      });

      // Mock cgroups v2 to return 1000 bytes limit (so 950/1000 = 95% > 90%)
      const mockFs = {
        readFile: vi.fn().mockResolvedValue('1000'),
      };
      vi.doMock('fs/promises', () => mockFs);

      // Mock checkDisk to return down status
      const originalCheckDisk = service.checkDisk;
      service.checkDisk = vi.fn().mockResolvedValue({
        status: 'down',
        used: 0,
        total: 0,
        usagePercent: 0,
        message: 'Disk unavailable',
      });

      const result = await service.getFullHealth();

      expect(result.status).toBe('error');

      vi.unmock('fs/promises');
      service.checkDisk = originalCheckDisk;
      vi.restoreAllMocks();
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('getLiveness', () => {
    it('should return alive status with timestamp and uptime', () => {
      const result = service.getLiveness();

      expect(result.status).toBe('alive');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getReadiness', () => {
    it('should return ready status when database and redis are up', async () => {
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getReadiness();

      expect(result.status).toBe('ready');
      expect(result).not.toHaveProperty('notReadyDependencies');
    });

    it('should return not_ready status when database is down', async () => {
      mockDataSource.query.mockRejectedValue(new Error('DB down'));
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.notReadyDependencies).toContain('database');
    });

    it('should return not_ready status when redis is down', async () => {
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);
      mockCacheManager.get.mockRejectedValue(new Error('Redis down'));

      const result = await service.getReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.notReadyDependencies).toContain('redis');
    });

    it('should return not_ready status when both database and redis are down', async () => {
      mockDataSource.query.mockRejectedValue(new Error('DB down'));
      mockCacheManager.get.mockRejectedValue(new Error('Redis down'));

      const result = await service.getReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.notReadyDependencies).toContain('database');
      expect(result.notReadyDependencies).toContain('redis');
    });
  });
});
