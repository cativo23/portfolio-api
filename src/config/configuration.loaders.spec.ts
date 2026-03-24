import {
  loadAppConfig,
  loadDatabaseConfig,
  loadRedisConfig,
  loadJwtConfig,
} from './configuration.loaders';

describe('configuration.loaders', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('loadAppConfig', () => {
    it('should return default values when no env vars are set', () => {
      delete process.env.CORS_ORIGINS;
      delete process.env.NODE_ENV;
      delete process.env.PORT;

      const config = loadAppConfig();

      expect(config).toEqual({
        nodeEnv: 'development',
        port: 3000,
        corsOrigins: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
        ],
      });
    });

    it('should parse custom CORS origins', () => {
      process.env.CORS_ORIGINS = 'https://example.com,https://api.example.com';

      const config = loadAppConfig();

      expect(config.corsOrigins).toEqual([
        'https://example.com',
        'https://api.example.com',
      ]);
    });

    it('should handle quoted CORS origins', () => {
      process.env.CORS_ORIGINS =
        '"https://example.com","https://api.example.com"';

      const config = loadAppConfig();

      expect(config.corsOrigins).toEqual([
        'https://example.com',
        'https://api.example.com',
      ]);
    });

    it('should parse custom NODE_ENV', () => {
      process.env.NODE_ENV = 'production';

      const config = loadAppConfig();

      expect(config.nodeEnv).toBe('production');
    });

    it('should parse custom PORT', () => {
      process.env.PORT = '8080';

      const config = loadAppConfig();

      expect(config.port).toBe(8080);
    });

    it('should parse quoted PORT', () => {
      process.env.PORT = '"8080"';

      const config = loadAppConfig();

      expect(config.port).toBe(8080);
    });
  });

  describe('loadDatabaseConfig', () => {
    it('should return default values when no env vars are set', () => {
      const config = loadDatabaseConfig();

      expect(config).toEqual({
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'portfolio',
        poolSize: 10,
        connectTimeout: 10000,
        connectionLimit: 10,
        queueLimit: 0,
        maxRetries: 5,
        retryDelay: 5000,
        sslEnabled: false,
        sslRejectUnauthorized: true,
        sslCaPath: undefined,
        sslKeyPath: undefined,
        sslCertPath: undefined,
        logLevels: ['error', 'warn', 'schema'],
        cacheEnabled: false,
        cacheDurationMs: 60000,
        cacheAlwaysEnabled: false,
      });
    });

    it('should parse custom database values', () => {
      process.env.DB_HOST = 'db.example.com';
      process.env.DB_PORT = '5432';
      process.env.DB_USERNAME = 'myuser';
      process.env.DB_PASSWORD = 'mypassword';
      process.env.DB_NAME = 'mydb';

      const config = loadDatabaseConfig();

      expect(config.host).toBe('db.example.com');
      expect(config.port).toBe(5432);
      expect(config.username).toBe('myuser');
      expect(config.password).toBe('mypassword');
      expect(config.database).toBe('mydb');
    });

    it('should parse SSL configuration', () => {
      process.env.DB_SSL_ENABLED = 'true';
      process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
      process.env.DB_SSL_CA = '/path/to/ca.pem';
      process.env.DB_SSL_KEY = '/path/to/key.pem';
      process.env.DB_SSL_CERT = '/path/to/cert.pem';

      const config = loadDatabaseConfig();

      expect(config.sslEnabled).toBe(true);
      expect(config.sslRejectUnauthorized).toBe(false);
      expect(config.sslCaPath).toBe('/path/to/ca.pem');
      expect(config.sslKeyPath).toBe('/path/to/key.pem');
      expect(config.sslCertPath).toBe('/path/to/cert.pem');
    });

    it('should parse cache configuration', () => {
      process.env.DB_CACHE_ENABLED = 'true';
      process.env.DB_CACHE_ALWAYS_ENABLED = 'yes';
      process.env.DB_CACHE_DURATION = '120000';

      const config = loadDatabaseConfig();

      expect(config.cacheEnabled).toBe(true);
      expect(config.cacheAlwaysEnabled).toBe(true);
      expect(config.cacheDurationMs).toBe(120000);
    });

    it('should parse custom log levels', () => {
      process.env.DB_LOG_LEVELS = 'error,warn,query';

      const config = loadDatabaseConfig();

      expect(config.logLevels).toEqual(['error', 'warn', 'query']);
    });

    it('should parse connection pool settings', () => {
      process.env.DB_POOL_SIZE = '20';
      process.env.DB_CONNECT_TIMEOUT = '5000';
      process.env.DB_CONNECTION_LIMIT = '15';
      process.env.DB_QUEUE_LIMIT = '100';
      process.env.DB_MAX_RETRIES = '3';
      process.env.DB_RETRY_DELAY = '2000';

      const config = loadDatabaseConfig();

      expect(config.poolSize).toBe(20);
      expect(config.connectTimeout).toBe(5000);
      expect(config.connectionLimit).toBe(15);
      expect(config.queueLimit).toBe(100);
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBe(2000);
    });
  });

  describe('loadRedisConfig', () => {
    it('should return default values when no env vars are set', () => {
      delete process.env.REDIS_HOST;
      delete process.env.REDIS_PORT;
      delete process.env.REDIS_PASSWORD;
      delete process.env.REDIS_TTL;

      const config = loadRedisConfig();

      expect(config).toEqual({
        host: 'localhost',
        port: 6379,
        password: undefined,
        ttlSeconds: 300,
      });
    });

    it('should parse custom Redis values', () => {
      process.env.REDIS_HOST = 'redis.example.com';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_PASSWORD = 'redispass';
      process.env.REDIS_TTL = '600';

      const config = loadRedisConfig();

      expect(config.host).toBe('redis.example.com');
      expect(config.port).toBe(6380);
      expect(config.password).toBe('redispass');
      expect(config.ttlSeconds).toBe(600);
    });

    it('should handle undefined password', () => {
      delete process.env.REDIS_PASSWORD;

      const config = loadRedisConfig();

      expect(config.password).toBeUndefined();
    });

    it('should handle empty password', () => {
      process.env.REDIS_PASSWORD = '';

      const config = loadRedisConfig();

      expect(config.password).toBeUndefined();
    });
  });

  describe('loadJwtConfig', () => {
    it('should return default values when no env vars are set', () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.NODE_ENV;

      const config = loadJwtConfig();

      expect(config).toEqual({
        secret: '',
        expiresInSeconds: 3600,
      });
    });

    it('should use test secret in test environment when no secret provided', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.JWT_SECRET;

      const config = loadJwtConfig();

      expect(config.secret).toBe('test-jwt-secret');
    });

    it('should use provided secret even in test environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.JWT_SECRET = 'my-test-secret';

      const config = loadJwtConfig();

      expect(config.secret).toBe('my-test-secret');
    });

    it('should parse custom JWT values', () => {
      process.env.JWT_SECRET = 'my-super-secret-key';
      process.env.JWT_EXPIRES_IN = '7200';

      const config = loadJwtConfig();

      expect(config.secret).toBe('my-super-secret-key');
      expect(config.expiresInSeconds).toBe(7200);
    });

    it('should parse quoted JWT secret', () => {
      process.env.JWT_SECRET = '"my-quoted-secret"';

      const config = loadJwtConfig();

      expect(config.secret).toBe('my-quoted-secret');
    });
  });
});
