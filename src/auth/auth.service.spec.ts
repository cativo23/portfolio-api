import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@app/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from '@app/users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const password = '123456';
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await bcryptjs.hash(password, 10);

    const mockUsersService: Partial<jest.Mocked<UsersService>> = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService: Partial<jest.Mocked<JwtService>> = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: ConfigService, useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
              };
              return config[key];
            }),
          }
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const payload: RegisterDto = { username: 'test', email: 'test@mail.com', password };
      const expectedUser: User = { id: 1, ...payload } as User;

      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(expectedUser);

      const result = await service.register(payload);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(payload.email);
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: payload.email,
        username: payload.username,
      }));
      expect(result).toMatchObject({ id: 1, username: payload.username, email: payload.email });
    });

    it('should throw if email already exists', async () => {
      const existingUser = { id: 1, email: 'test@mail.com', password, username: 'testuser' } as User;
      usersService.findOneByEmail.mockResolvedValue(existingUser);

      await expect(
        service.register({ username: 'test', email: 'test@mail.com', password }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should return user if password matches', async () => {
      const user = { id: 1, email: 'test@mail.com', password: hashedPassword } as User;
      usersService.findOneByEmail.mockResolvedValue(user);

      const result = await service.validateUser(user.email, password);

      expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.validateUser('notfound@mail.com', password)).rejects.toThrow(BadRequestException);
    });

    it('should throw if password does not match', async () => {
      const user = { id: 1, email: 'test@mail.com', password: hashedPassword } as User;
      usersService.findOneByEmail.mockResolvedValue(user);

      await expect(service.validateUser(user.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const fixedNow = 1700000000000;

    beforeEach(() => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => fixedNow);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return access token and user info on success', async () => {
      const user = { id: 1, email: 'test@mail.com', username: 'test', password: hashedPassword } as User;

      usersService.findOneByEmail.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('fake-jwt-token');
      configService.get.mockReturnValue(3600); // 1 hour

      const result = await service.login(user.email, password);

      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        expires_at: new Date(fixedNow + 3600 * 1000),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });

    it('should throw if credentials are invalid', async () => {
      const user = { id: 1, email: 'test@mail.com', username: 'test', password: hashedPassword } as User;
      usersService.findOneByEmail.mockResolvedValue(user);

      await expect(service.login(user.email, 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });
  });
});
