import { vi, type Mock, type SpyInstance, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  const loggerSpy = vi
    .spyOn(Logger.prototype, 'log')
    .mockImplementation(vi.fn());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    vi.clearAllMocks(); // Reset spies between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return the new user', async () => {
      const dto: CreateUserDto = {
        email: 'user@email.com',
        password: 'password123',
        username: 'testuser',
      };

      const expectedUser: User = {
        id: 1,
        ...dto,
      } as User;

      vi.spyOn(repository, 'create').mockReturnValue(expectedUser);
      vi.spyOn(repository, 'save').mockResolvedValue(expectedUser);

      const result = await service.create(dto);

      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
        username: dto.username,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return the user when found', async () => {
      const email = 'user@email.com';
      const user: User = {
        id: 1,
        email,
        password: 'hashedpassword',
        username: 'testuser',
      } as User;

      vi.spyOn(repository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ email });
      expect(loggerSpy).toHaveBeenCalledWith(`User with email ${email} found.`);
    });

    it('should return undefined and log when user is not found', async () => {
      const email = 'notfound@email.com';
      vi.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findOneByEmail(email);
      expect(result).toBeUndefined();
      expect(repository.findOneBy).toHaveBeenCalledWith({ email });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User with email ${email} not found.`,
      );
    });
  });
});
