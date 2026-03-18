import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AccessTokenPayload } from '@auth/types/AccessTokenPayload';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'jwt') {
          return { secret: 'test_jwt_secret', expiresInSeconds: 3600 };
        }
        throw new Error(`unknown key ${key}`);
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
      expect(configService.getOrThrow).toHaveBeenCalledWith('jwt');
    });
  });

  describe('validate', () => {
    it('should return the payload', async () => {
      const mockPayload: AccessTokenPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000' as any,
        email: 'test@example.com',
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
    });

    it('should handle payloads with additional properties', async () => {
      const mockPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000' as any,
        email: 'test@example.com',
        additionalProp: 'value',
      };

      const result = await strategy.validate(mockPayload as any);

      expect(result).toEqual(mockPayload);
    });
  });
});
