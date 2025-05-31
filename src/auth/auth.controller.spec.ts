import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@app/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@app/users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data on successful login', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'secure123',
      };
      mockAuthService.login.mockResolvedValue(mockUser);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw if AuthService throws', async () => {
      const dto: LoginDto = { email: 'wrong@example.com', password: 'badpass' };
      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Invalid credentials'),
      );

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);
      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });
  });

  describe('register', () => {
    it('should return created user on success', async () => {
      const dto: CreateUserDto = {
        username: 'jane',
        email: 'jane@example.com',
        password: 'supersecure',
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith({
        username: dto.username,
        email: dto.email,
        password: dto.password,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if email is taken', async () => {
      const dto: CreateUserDto = {
        username: 'existing',
        email: 'taken@example.com',
        password: 'password123',
      };
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.register(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.register).toHaveBeenCalled();
    });
  });
  describe('profile', () => {
    it('should return both user from decorator and req.user', () => {
      const mockRequest = { user: mockUser };
      const mockUserDecorator = { id: 2, username: 'decorator', email: 'decorator@example.com' };

      const result = controller.profile(mockRequest as any, mockUserDecorator);

      expect(result).toEqual({
        user: mockUserDecorator,
        req_user: mockUser,
      });
    });

    it('should handle missing user decorator gracefully', () => {
      const mockRequest = { user: mockUser };

      const result = controller.profile(mockRequest as any, undefined);

      expect(result).toEqual({
        user: undefined,
        req_user: mockUser,
      });
    });

    it('should handle missing req.user gracefully', () => {
      const mockRequest = {};

      const mockUserDecorator = { id: 3, username: 'decorator2', email: 'decorator2@example.com' };

      const result = controller.profile(mockRequest as any, mockUserDecorator);

      expect(result).toEqual({
        user: mockUserDecorator,
        req_user: undefined,
      });
    });
  });
});
