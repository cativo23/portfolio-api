import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionService } from './transaction.service';

const mockQueryRunner = {
  connect: vi.fn(),
  startTransaction: vi.fn(),
  commitTransaction: vi.fn(),
  rollbackTransaction: vi.fn(),
  release: vi.fn(),
  manager: {
    findOne: vi.fn(),
    save: vi.fn(),
  } as unknown as EntityManager,
};

const mockDataSource = {
  createQueryRunner: vi.fn(),
  manager: {} as EntityManager,
};

describe('TransactionService', () => {
  let service: TransactionService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    dataSource = module.get<DataSource>(DataSource);

    vi.clearAllMocks();
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeInTransaction', () => {
    beforeEach(() => {
      mockQueryRunner.connect.mockResolvedValue(undefined);
      mockQueryRunner.startTransaction.mockResolvedValue(undefined);
      mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
      mockQueryRunner.release.mockResolvedValue(undefined);
    });

    it('should execute callback in transaction and commit', async () => {
      const mockCallback = vi.fn().mockResolvedValue('result');

      const result = await service.executeInTransaction(mockCallback);

      expect(result).toBe('result');
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(mockQueryRunner.manager);
    });

    it('should rollback transaction on error', async () => {
      const mockError = new Error('Transaction failed');
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      await expect(service.executeInTransaction(mockCallback)).rejects.toThrow(
        'Transaction failed',
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should release query runner even on error', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Fail'));

      try {
        await service.executeInTransaction(mockCallback);
      } catch {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should return callback result', async () => {
      const mockResult = { id: 1, name: 'test' };
      const mockCallback = vi.fn().mockResolvedValue(mockResult);

      const result = await service.executeInTransaction(mockCallback);

      expect(result).toEqual(mockResult);
    });
  });

  describe('executeWithQueryRunner', () => {
    beforeEach(() => {
      mockQueryRunner.connect.mockResolvedValue(undefined);
      mockQueryRunner.release.mockResolvedValue(undefined);
    });

    it('should execute callback with query runner', async () => {
      const mockCallback = vi.fn().mockResolvedValue('result');

      const result = await service.executeWithQueryRunner(mockCallback);

      expect(result).toBe('result');
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(mockQueryRunner);
    });

    it('should release query runner on error', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Fail'));

      try {
        await service.executeWithQueryRunner(mockCallback);
      } catch {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should return callback result', async () => {
      const mockResult = { id: 1 };
      const mockCallback = vi.fn().mockResolvedValue(mockResult);

      const result = await service.executeWithQueryRunner(mockCallback);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getManager', () => {
    it('should return the data source manager', () => {
      const manager = service.getManager();

      expect(manager).toBe(dataSource.manager);
    });
  });
});
