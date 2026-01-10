import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AccessTokenPayload } from '@auth/types/AccessTokenPayload';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Mock the ConfigService
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test_jwt_secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('constructor', () => {
    it('should configure the strategy with correct options', () => {
      // This test verifies that the strategy is configured correctly
      // We can't directly test the super() call, but we can test that the ConfigService was called
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    it('should return the payload', async () => {
      // Create a mock payload
      const mockPayload: AccessTokenPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000' as any,
        email: 'test@example.com',
      };

      // Call the validate method
      const result = await strategy.validate(mockPayload);

      // Verify that the method returns the payload
      expect(result).toEqual(mockPayload);
    });

    it('should handle payloads with additional properties', async () => {
      // Create a mock payload with additional properties
      const mockPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000' as any,
        email: 'test@example.com',
        additionalProp: 'value',
      };

      // Call the validate method
      const result = await strategy.validate(mockPayload as any);

      // Verify that the method returns the entire payload
      expect(result).toEqual(mockPayload);
    });
  });
});
