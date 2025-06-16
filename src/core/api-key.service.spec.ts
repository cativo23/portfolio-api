import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { Repository } from 'typeorm';

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
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repo = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an API key', async () => {
    jest
      .spyOn(repo, 'create')
      .mockReturnValue({ key: 'abc', isActive: true } as any);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue({ id: 1, key: 'abc', isActive: true } as any);
    const result = await service.create('desc');
    expect(result.key).toBe('abc');
    expect(result.isActive).toBe(true);
  });

  it('should validate a valid API key', async () => {
    jest
      .spyOn(repo, 'findOne')
      .mockResolvedValue({ key: 'abc', isActive: true } as any);
    const valid = await service.validate('abc');
    expect(valid).toBe(true);
  });

  it('should not validate an invalid API key', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
    const valid = await service.validate('badkey');
    expect(valid).toBe(false);
  });

  it('should revoke an API key', async () => {
    const updateSpy = jest.spyOn(repo, 'update').mockResolvedValue({} as any);
    await service.revoke('abc');
    expect(updateSpy).toHaveBeenCalledWith({ key: 'abc' }, { isActive: false });
  });
});
