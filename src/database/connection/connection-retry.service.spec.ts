import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConnectionRetryService } from './connection-retry.service';

describe('ConnectionRetryService', () => {
  let service: ConnectionRetryService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockDataSource = {
      isInitialized: false,
      initialize: jest.fn(),
      query: jest.fn(),
    } as any;

    mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue({
        maxRetries: 3,
        retryDelay: 100, // Usar delay corto para tests
      }),
    };

    service = new ConnectionRetryService(
      mockDataSource as unknown as DataSource,
      mockConfigService as ConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connect', () => {
    it('should connect successfully on first attempt', async () => {
      mockDataSource.initialize.mockResolvedValueOnce(undefined);

      const result = await service.connect();

      expect(result).toBe(true);
      expect(mockDataSource.initialize).toHaveBeenCalledTimes(1);
    });

    it('should return true if already initialized', async () => {
      (mockDataSource as any).isInitialized = true;

      const result = await service.connect();

      expect(result).toBe(true);
      expect(mockDataSource.initialize).not.toHaveBeenCalled();
    });

    it('should retry on failure and succeed', async () => {
      mockDataSource.initialize
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      const result = await service.connect();

      expect(result).toBe(true);
      expect(mockDataSource.initialize).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      mockDataSource.initialize.mockRejectedValue(
        new Error('Connection refused'),
      );

      await expect(service.connect()).rejects.toThrow(
        'Failed to connect to database after 3 attempts',
      );
      expect(mockDataSource.initialize).toHaveBeenCalledTimes(3);
    });
  });

  describe('isHealthy', () => {
    it('should return true when database is connected and query succeeds', async () => {
      (mockDataSource as any).isInitialized = true;
      (mockDataSource.query as jest.Mock).mockResolvedValueOnce([{ '1': 1 }]);

      const result = await service.isHealthy();

      expect(result).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database is not initialized', async () => {
      (mockDataSource as any).isInitialized = false;

      const result = await service.isHealthy();

      expect(result).toBe(false);
      expect(mockDataSource.query).not.toHaveBeenCalled();
    });

    it('should return false when query fails', async () => {
      (mockDataSource as any).isInitialized = true;
      (mockDataSource.query as jest.Mock).mockRejectedValueOnce(
        new Error('Query failed'),
      );

      const result = await service.isHealthy();

      expect(result).toBe(false);
    });
  });
});
