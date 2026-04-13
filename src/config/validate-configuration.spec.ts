import { vi, type Mock, type SpyInstance, type Mocked } from 'vitest';
import { validateConfiguration } from './validate-configuration';

describe('validateConfiguration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should skip validation in test environment', () => {
      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
    });

    it('should return config even with missing required values in test mode', () => {
      const config = { database: {}, jwt: {}, redis: {}, apiKey: {} };
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
    });
  });

  describe('development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should warn but not throw for missing JWT_SECRET', () => {
      process.env.JWT_SECRET = '';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('JWT_SECRET'),
      );
    });

    it('should warn but not throw for missing DB_HOST', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = '';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('DB_HOST'),
      );
    });

    it('should warn but not throw for missing DB_USERNAME', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = '';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('DB_USERNAME'),
      );
    });

    it('should warn but not throw for missing DB_NAME', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = '';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('DB_NAME'),
      );
    });

    it('should warn but not throw for missing REDIS_HOST', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = '';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('REDIS_HOST'),
      );
    });

    it('should warn but not throw for missing API_KEY_SECRET', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = '';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('API_KEY_SECRET'),
      );
    });

    it('should not warn when all configs are provided via process.env', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn when all configs are provided via config namespaces', () => {
      const config = {
        jwt: { secret: 'secret' },
        database: { host: 'localhost', username: 'user', database: 'testdb' },
        redis: { host: 'localhost' },
        apiKey: { secret: 'secret' },
      };

      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should throw for missing JWT_SECRET', () => {
      process.env.JWT_SECRET = '';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      expect(() => validateConfiguration({})).toThrow('JWT_SECRET is required');
    });

    it('should throw for missing DB_HOST', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = '';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      expect(() => validateConfiguration({})).toThrow('DB_HOST is required');
    });

    it('should throw for missing DB_USERNAME', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = '';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      expect(() => validateConfiguration({})).toThrow(
        'DB_USERNAME is required',
      );
    });

    it('should throw for missing DB_NAME', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = '';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      expect(() => validateConfiguration({})).toThrow('DB_NAME is required');
    });

    it('should throw for missing REDIS_HOST', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = '';
      process.env.API_KEY_SECRET = 'secret';

      expect(() => validateConfiguration({})).toThrow('REDIS_HOST is required');
    });

    it('should throw for missing API_KEY_SECRET', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = '';

      expect(() => validateConfiguration({})).toThrow(
        'API_KEY_SECRET is required',
      );
    });

    it('should throw with multiple missing configs', () => {
      process.env.JWT_SECRET = '';
      process.env.DB_HOST = '';
      process.env.DB_USERNAME = '';
      process.env.DB_NAME = '';
      process.env.REDIS_HOST = '';
      process.env.API_KEY_SECRET = '';

      expect(() => validateConfiguration({})).toThrow('Configuration errors');
    });

    it('should pass validation when all configs are provided', () => {
      const config = {
        jwt: { secret: 'secret' },
        database: { host: 'localhost', username: 'user', database: 'testdb' },
        redis: { host: 'localhost' },
        apiKey: { secret: 'secret' },
      };

      const result = validateConfiguration(config);
      expect(result).toEqual(config);
    });
  });

  describe('default environment (undefined)', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should treat as development and warn for missing configs', () => {
      process.env.JWT_SECRET = '';
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_NAME = 'testdb';
      process.env.REDIS_HOST = 'localhost';
      process.env.API_KEY_SECRET = 'secret';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('trimEnvQuotes integration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should handle quoted values in environment variables', () => {
      process.env.JWT_SECRET = '"my-secret"';
      process.env.DB_HOST = '"localhost"';
      process.env.DB_USERNAME = '"user"';
      process.env.DB_NAME = '"testdb"';
      process.env.REDIS_HOST = '"localhost"';
      process.env.API_KEY_SECRET = '"secret"';

      const config = {};
      const result = validateConfiguration(config);
      expect(result).toEqual(config);
    });
  });
});
