import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '@auth/auth.service';
import { User } from '@users/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // Mock the AuthService
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw UnauthorizedException when user validation fails', async () => {
      // Mock the AuthService to return null (validation failed)
      authService.validateUser.mockResolvedValue(null);

      // Call the validate method and expect it to throw
      await expect(
        strategy.validate('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);

      // Verify that AuthService.validateUser was called with the correct parameters
      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
    });

    it('should return the user when validation succeeds', async () => {
      // Create a mock user
      const mockUser = { id: 1, email: 'test@example.com' } as User;

      // Mock the AuthService to return the user (validation succeeded)
      authService.validateUser.mockResolvedValue(mockUser);

      // Call the validate method
      const result = await strategy.validate('test@example.com', 'password');

      // Verify that the method returns the user
      expect(result).toEqual(mockUser);

      // Verify that AuthService.validateUser was called with the correct parameters
      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
    });

    it('should handle empty credentials', async () => {
      // Mock the AuthService to return null (validation failed)
      authService.validateUser.mockResolvedValue(null);

      // Call the validate method with empty credentials and expect it to throw
      await expect(strategy.validate('', '')).rejects.toThrow(
        UnauthorizedException,
      );

      // Verify that AuthService.validateUser was called with empty credentials
      expect(authService.validateUser).toHaveBeenCalledWith('', '');
    });
  });
});
