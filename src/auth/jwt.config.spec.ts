import { ConfigService } from '@nestjs/config';
import { jwtConfigFactory } from './jwt.config';

describe('jwtConfigFactory', () => {
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  it('should return correct JWT config', async () => {
    // Mock successful responses
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'my-secret';
      return null;
    });
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'JWT_EXPIRES_IN') return '3600';
      throw new Error('Key not found');
    });

    const config = await jwtConfigFactory(mockConfigService);

    expect(config).toEqual({
      secret: 'my-secret',
      signOptions: { expiresIn: '3600s' },
    });

    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('JWT_EXPIRES_IN');
  });

  it('should use undefined as secret when JWT_SECRET is not defined', async () => {
    // Mock missing JWT_SECRET
    mockConfigService.get.mockReturnValue(undefined);
    mockConfigService.getOrThrow.mockReturnValue('3600');

    const config = await jwtConfigFactory(mockConfigService);

    expect(config.secret).toBeUndefined();
    expect(config.signOptions.expiresIn).toBe('3600s');
  });

  it('should throw error when JWT_EXPIRES_IN is not defined', async () => {
    // Mock successful JWT_SECRET but missing JWT_EXPIRES_IN
    mockConfigService.get.mockReturnValue('my-secret');
    mockConfigService.getOrThrow.mockImplementation(() => {
      throw new Error('Config key "JWT_EXPIRES_IN" is not defined');
    });

    await expect(jwtConfigFactory(mockConfigService)).rejects.toThrow(
      'Config key "JWT_EXPIRES_IN" is not defined',
    );
  });
});
