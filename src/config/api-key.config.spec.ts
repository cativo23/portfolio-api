import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import apiKeyConfig from './api-key.config';

describe('apiKeyConfig', () => {
  const prev = process.env.API_KEY_SECRET;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.API_KEY_SECRET;
    } else {
      process.env.API_KEY_SECRET = prev;
    }
  });

  it('fails bootstrap when API_KEY_SECRET is unset', async () => {
    delete process.env.API_KEY_SECRET;
    await expect(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true, load: [apiKeyConfig] }),
        ],
      }).compile(),
    ).rejects.toThrow('API_KEY_SECRET');
  });

  it('exposes secret when API_KEY_SECRET is set', async () => {
    process.env.API_KEY_SECRET = 'unit-test-api-key-secret-value';
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [apiKeyConfig] }),
      ],
    }).compile();
    const config = moduleRef.get(ConfigService);
    expect(config.get('apiKey')).toEqual({
      secret: 'unit-test-api-key-secret-value',
    });
  });
});
