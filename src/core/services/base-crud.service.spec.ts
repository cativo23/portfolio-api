import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseCrudService } from './base-crud.service';
import { DeleteResponseDto } from '@core/dto';

class TestEntity {
  id: number;
  name: string;
}

class TestCreateDto {
  name: string;
}

class TestUpdateDto {
  name?: string;
}

class TestService extends BaseCrudService<
  TestEntity,
  TestCreateDto,
  TestUpdateDto
> {
  protected readonly repository: Repository<TestEntity> =
    {} as Repository<TestEntity>;
  protected readonly logger: Logger = new Logger(TestService.name);

  protected getEntityName(): string {
    return 'TestEntity';
  }

  // Setter for testing purposes
  setRepository(repository: Repository<TestEntity>) {
    (this as any).repository = repository;
  }
}

describe('BaseCrudService', () => {
  let service: TestService;
  let repository: jest.Mocked<Repository<TestEntity>>;
  let logger: Logger;

  const mockEntity: TestEntity = {
    id: 1,
    name: 'Test Entity',
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      merge: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
    } as any;

    service = new TestService();
    service.setRepository(repository);
    logger = service['logger'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: TestCreateDto = { name: 'New Entity' };
    const createdEntity = { ...mockEntity, ...createDto };

    it('should create and return the entity', async () => {
      repository.create.mockReturnValue(createdEntity as any);
      repository.save.mockResolvedValue(createdEntity as any);

      const result = await service.create(createDto);

      expect(result).toEqual(createdEntity);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
    });

    it('should log the creation', async () => {
      repository.create.mockReturnValue(createdEntity as any);
      repository.save.mockResolvedValue(createdEntity as any);
      jest.spyOn(logger, 'log').mockImplementation(() => {});

      await service.create(createDto);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('TestEntity created with ID'),
      );
    });
  });

  describe('findOne', () => {
    it('should return the entity when found', async () => {
      repository.findOne.mockResolvedValue(mockEntity as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEntity);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when entity is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrowError(
        'TestEntity with ID 999 not found',
      );
    });

    it('should log warning when entity is not found', async () => {
      repository.findOne.mockResolvedValue(null);
      jest.spyOn(logger, 'warn').mockImplementation(() => {});

      try {
        await service.findOne(999);
      } catch {
        // Expected to throw
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('TestEntity with ID 999 not found'),
      );
    });

    it('should log when entity is found', async () => {
      repository.findOne.mockResolvedValue(mockEntity as any);
      jest.spyOn(logger, 'log').mockImplementation(() => {});

      await service.findOne(1);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Found testentity with ID 1'),
      );
    });
  });

  describe('update', () => {
    const updateDto: TestUpdateDto = { name: 'Updated Name' };
    const existingEntity = { ...mockEntity };
    const updatedEntity = { ...mockEntity, ...updateDto };

    it('should update and return the entity', async () => {
      repository.findOne.mockResolvedValue(existingEntity as any);
      repository.merge.mockReturnValue(updatedEntity as any);
      repository.save.mockResolvedValue(updatedEntity as any);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedEntity);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.merge).toHaveBeenCalledWith(existingEntity, updateDto);
      expect(repository.save).toHaveBeenCalledWith(updatedEntity);
    });

    it('should throw NotFoundException when entity to update is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrowError(
        'TestEntity with ID 999 not found',
      );
    });

    it('should log warning when entity to update is not found', async () => {
      repository.findOne.mockResolvedValue(null);
      jest.spyOn(logger, 'warn').mockImplementation(() => {});

      try {
        await service.update(999, updateDto);
      } catch {
        // Expected to throw
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('TestEntity with ID 999 not found'),
      );
    });

    it('should log when entity is updated', async () => {
      repository.findOne.mockResolvedValue(existingEntity as any);
      repository.merge.mockReturnValue(updatedEntity as any);
      repository.save.mockResolvedValue(updatedEntity as any);
      jest.spyOn(logger, 'log').mockImplementation(() => {});

      await service.update(1, updateDto);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Updated testentity with ID 1'),
      );
    });
  });

  describe('remove', () => {
    it('should soft remove the entity and return DeleteResponseDto', async () => {
      repository.findOne.mockResolvedValue(mockEntity as any);
      repository.softRemove.mockResolvedValue(mockEntity as any);

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(repository.softRemove).toHaveBeenCalledWith(mockEntity);
    });

    it('should throw NotFoundException when entity to delete is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrowError(
        'TestEntity with ID 999 not found',
      );
    });

    it('should log warning when entity to delete is not found', async () => {
      repository.findOne.mockResolvedValue(null);
      jest.spyOn(logger, 'warn').mockImplementation(() => {});

      try {
        await service.remove(999);
      } catch {
        // Expected to throw
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('TestEntity with ID 999 not found'),
      );
    });

    it('should log when entity is deleted', async () => {
      repository.findOne.mockResolvedValue(mockEntity as any);
      repository.softRemove.mockResolvedValue(mockEntity as any);
      jest.spyOn(logger, 'log').mockImplementation(() => {});

      await service.remove(1);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Soft-deleted testentity with ID 1'),
      );
    });
  });

  describe('restore', () => {
    it('should restore the entity and return it', async () => {
      repository.restore.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(mockEntity as any);

      const result = await service.restore(1);

      expect(result).toEqual(mockEntity);
      expect(repository.restore).toHaveBeenCalledWith(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when entity to restore is not found', async () => {
      repository.restore.mockResolvedValue({ affected: 0 } as any);

      await expect(service.restore(999)).rejects.toThrowError(
        'TestEntity with ID 999 not found',
      );
    });

    it('should log warning when entity to restore is not found', async () => {
      repository.restore.mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(logger, 'warn').mockImplementation(() => {});

      try {
        await service.restore(999);
      } catch {
        // Expected to throw
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('TestEntity with ID 999 not found'),
      );
    });

    it('should log when entity is restored', async () => {
      repository.restore.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(mockEntity as any);
      jest.spyOn(logger, 'log').mockImplementation(() => {});

      await service.restore(1);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Restored testentity with ID 1'),
      );
    });
  });
});
