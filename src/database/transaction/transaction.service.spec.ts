import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionService } from './transaction.service';

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as EntityManager,
};

const mockDataSource = {
  createQueryRunner: jest.fn(),
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

    jest.clearAllMocks();
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
      const mockCallback = jest.fn().mockResolvedValue('result');

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
      const mockCallback = jest.fn().mockRejectedValue(mockError);

      await expect(service.executeInTransaction(mockCallback)).rejects.toThrow(
        'Transaction failed',
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should release query runner even on error', async () => {
      const mockCallback = jest.fn().mockRejectedValue(new Error('Fail'));

      try {
        await service.executeInTransaction(mockCallback);
      } catch {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should return callback result', async () => {
      const mockResult = { id: 1, name: 'test' };
      const mockCallback = jest.fn().mockResolvedValue(mockResult);

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
      const mockCallback = jest.fn().mockResolvedValue('result');

      const result = await service.executeWithQueryRunner(mockCallback);

      expect(result).toBe('result');
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(mockQueryRunner);
    });

    it('should release query runner on error', async () => {
      const mockCallback = jest.fn().mockRejectedValue(new Error('Fail'));

      try {
        await service.executeWithQueryRunner(mockCallback);
      } catch {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should return callback result', async () => {
      const mockResult = { id: 1 };
      const mockCallback = jest.fn().mockResolvedValue(mockResult);

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
