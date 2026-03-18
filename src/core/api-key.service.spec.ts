import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const TEST_SECRET = 'test-api-key-secret';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repo: Repository<ApiKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'apiKey') return { secret: TEST_SECRET };
              throw new Error(`Unknown config: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repo = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an API key and return plainKey + entity', async () => {
      jest.spyOn(repo, 'create').mockImplementation((data: any) => data as any);
      jest
        .spyOn(repo, 'save')
        .mockImplementation(async (entity: any) => ({ id: 1, ...entity }));

      const result = await service.create('desc');

      expect(result.plainKey).toBeDefined();
      expect(result.plainKey).toHaveLength(64);
      expect(result.apiKey.hashedKey).toBeDefined();
      expect(result.apiKey.hashedKey).not.toBe(result.plainKey);
      expect(result.apiKey.description).toBe('desc');
    });

    it('should hash the key with HMAC-SHA256 using the secret', async () => {
      let savedHashedKey: string;
      jest.spyOn(repo, 'create').mockImplementation((data: any) => data as any);
      jest.spyOn(repo, 'save').mockImplementation(async (entity: any) => {
        savedHashedKey = entity.hashedKey;
        return { id: 1, ...entity };
      });

      const result = await service.create('desc');
      const expectedHash = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(result.plainKey)
        .digest('hex');

      expect(savedHashedKey).toBe(expectedHash);
    });
  });

  describe('validate', () => {
    it('should hash input and find matching key', async () => {
      const plainKey = 'test-plain-key';
      const hashedKey = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(plainKey)
        .digest('hex');

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        hashedKey,
        isActive: true,
      } as any);

      const valid = await service.validate(plainKey);

      expect(valid).toBe(true);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { hashedKey, isActive: true },
      });
    });

    it('should return false for invalid key', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
      const valid = await service.validate('badkey');
      expect(valid).toBe(false);
    });
  });

  describe('revokeById', () => {
    it('should deactivate an API key by id', async () => {
      const updateSpy = jest.spyOn(repo, 'update').mockResolvedValue({} as any);
      await service.revokeById(1);
      expect(updateSpy).toHaveBeenCalledWith({ id: 1 }, { isActive: false });
    });
  });
});
