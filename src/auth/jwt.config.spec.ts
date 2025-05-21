import { ConfigService } from '@nestjs/config';
import { jwtConfigFactory } from './jwt.config';

describe('jwtConfigFactory', () => {
  it('should return correct JWT config', async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'my-secret';
        return null;
      }),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '3600';
        throw new Error('Key not found');
      }),
    } as unknown as ConfigService;

    const config = await jwtConfigFactory(mockConfigService);

    expect(config).toEqual({
      secret: 'my-secret',
      signOptions: { expiresIn: '3600s' },
    });

    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('JWT_EXPIRES_IN');
  });
});
