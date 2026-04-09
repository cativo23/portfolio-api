import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Logger, NotFoundException } from '@nestjs/common';

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

    it('should return undefined and log when user is not found', async () => {
      const email = 'notfound@email.com';
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findOneByEmail(email);
      expect(result).toBeUndefined();
      expect(repository.findOneBy).toHaveBeenCalledWith({ email });
      expect(loggerSpy).toHaveBeenCalledWith(
        `User with email ${email} not found.`,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users ordered by createdAt DESC', async () => {
      const users: User[] = [
        { id: 1, username: 'user1', email: 'a@b.com', password: 'hash' } as User,
        { id: 2, username: 'user2', email: 'c@d.com', password: 'hash' } as User,
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the user when found', async () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'user@email.com',
        password: 'hashedpassword',
      } as User;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update username and email', async () => {
      const existingUser: User = {
        id: 1,
        username: 'oldname',
        email: 'old@email.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const updateDto: UpdateUserDto = {
        username: 'newname',
        email: 'new@email.com',
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUser);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...existingUser,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.username).toBe('newname');
      expect(result.email).toBe('new@email.com');
    });

    it('should hash password when updating password', async () => {
      const existingUser: User = {
        id: 1,
        username: 'testuser',
        email: 'user@email.com',
        password: 'oldhash',
      } as User;

      const updateDto: UpdateUserDto = { password: 'NewStr0ng!Pass' };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUser);
      jest.spyOn(repository, 'save').mockImplementation((user) =>
        Promise.resolve(user as User),
      );

      const result = await service.update(1, updateDto);

      expect(result.password).not.toBe('NewStr0ng!Pass');
      expect(result.password).toBeTruthy();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      const updateDto: UpdateUserDto = { username: 'newname' };

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete the user', async () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'user@email.com',
        password: 'hashedpassword',
      } as User;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(user);

      await service.remove(1);

      expect(repository.softRemove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
