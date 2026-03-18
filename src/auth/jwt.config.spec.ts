import { ConfigService } from '@nestjs/config';
import { jwtConfigFactory } from './jwt.config';
import type { JwtConfig } from '@config/configuration.types';

describe('jwtConfigFactory', () => {
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  it('should return correct JWT config', async () => {
    const jwt: JwtConfig = {
      secret: 'my-secret',
      expiresInSeconds: 3600,
    };
    mockConfigService.getOrThrow.mockReturnValue(jwt);

    const config = await jwtConfigFactory(mockConfigService);

    expect(config).toEqual({
      secret: 'my-secret',
      signOptions: { expiresIn: '3600s' },
    });

    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('jwt');
  });

  it('should throw when JWT secret is empty', async () => {
    mockConfigService.getOrThrow.mockReturnValue({
      secret: '',
      expiresInSeconds: 3600,
    });

    await expect(jwtConfigFactory(mockConfigService)).rejects.toThrow(
      'JWT_SECRET is not set',
    );
  });

  it('should throw when jwt namespace is missing', async () => {
    mockConfigService.getOrThrow.mockImplementation(() => {
      throw new Error('Config key "jwt" is not defined');
    });

    await expect(jwtConfigFactory(mockConfigService)).rejects.toThrow(
      'Config key "jwt" is not defined',
    );
  });
});
