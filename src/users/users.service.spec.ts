import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException, Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  const loggerSpy = jest
    .spyOn(Logger.prototype, 'log')
    .mockImplementation(jest.fn());

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
    jest.clearAllMocks(); // Reset spies between tests
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

      jest.spyOn(repository, 'create').mockReturnValue(expectedUser);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedUser);

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

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ email });
      expect(loggerSpy).toHaveBeenCalledWith(`User with email ${email} found.`);
    });

    it('should throw NotFoundException and log when user is not found', async () => {
      const email = 'notfound@email.com';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.findOneByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ email });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User with email ${email} not found.`,
      );
    });
  });
});
