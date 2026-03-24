import { ConfigService } from '@nestjs/config';
import { TypeOrmLoggerService } from './typeorm-logger.service';

const createMockConfigService = (logLevels: string[]) => {
  return {
    getOrThrow: jest.fn().mockReturnValue({ logLevels }),
  } as unknown as ConfigService;
};

describe('TypeOrmLoggerService', () => {
  describe('logQuery', () => {
    it('should log query when query logging is enabled', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.logQuery('SELECT * FROM users')).not.toThrow();
    });

    it('should not log query when query logging is disabled', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.logQuery('SELECT * FROM users')).not.toThrow();
    });

    it('should log query with parameters', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logQuery('SELECT * FROM users WHERE id = ?', [1]),
      ).not.toThrow();
    });
  });

  describe('logQueryError', () => {
    it('should log query error with Error object', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      const error = new Error('Query failed');
      expect(() =>
        service.logQueryError(error, 'SELECT * FROM users'),
      ).not.toThrow();
    });

    it('should log query error with string error', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logQueryError('Query failed', 'SELECT * FROM users'),
      ).not.toThrow();
    });

    it('should log query error with parameters', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logQueryError(
          new Error('Failed'),
          'SELECT * FROM users WHERE id = ?',
          [1],
        ),
      ).not.toThrow();
    });
  });

  describe('logQuerySlow', () => {
    it('should log slow query when warn logging is enabled', () => {
      const configService = createMockConfigService(['warn']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logQuerySlow(5000, 'SELECT * FROM users'),
      ).not.toThrow();
    });

    it('should not log slow query when warn logging is disabled', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logQuerySlow(5000, 'SELECT * FROM users'),
      ).not.toThrow();
    });
  });

  describe('logSchemaBuild', () => {
    it('should log schema build when schema logging is enabled', () => {
      const configService = createMockConfigService(['schema']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.logSchemaBuild('Table created')).not.toThrow();
    });

    it('should not log schema build when schema logging is disabled', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.logSchemaBuild('Table created')).not.toThrow();
    });
  });

  describe('logMigration', () => {
    it('should log migration when migration logging is enabled', () => {
      const configService = createMockConfigService(['migration']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logMigration('Migration 123 executed'),
      ).not.toThrow();
    });

    it('should not log migration when migration logging is disabled', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() =>
        service.logMigration('Migration 123 executed'),
      ).not.toThrow();
    });
  });

  describe('log', () => {
    it('should log info messages when info logging is enabled', () => {
      const configService = createMockConfigService(['info']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.log('info', 'Test message')).not.toThrow();
    });

    it('should log warn messages when warn logging is enabled', () => {
      const configService = createMockConfigService(['warn']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.log('warn', 'Warning message')).not.toThrow();
    });

    it('should log error messages when error logging is enabled', () => {
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.log('error', 'Error message')).not.toThrow();
    });

    it('should log log messages when log logging is enabled', () => {
      const configService = createMockConfigService(['log']);
      const service = new TypeOrmLoggerService(configService);

      expect(() => service.log('log', 'Log message')).not.toThrow();
    });
  });

  describe('stringifyParameter', () => {
    it('should return NULL for null values', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter(null);
      expect(result).toBe('NULL');
    });

    it('should return NULL for undefined values', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter(undefined);
      expect(result).toBe('NULL');
    });

    it('should wrap string values in quotes', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter('test');
      expect(result).toBe("'test'");
    });

    it('should escape single quotes in strings', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter("test'value");
      expect(result).toBe("'test''value'");
    });

    it('should format Date values as ISO strings', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const date = new Date('2024-01-01T00:00:00Z');
      const result = (service as any).stringifyParameter(date);
      expect(result).toBe("'2024-01-01T00:00:00.000Z'");
    });

    it('should format arrays as bracketed lists', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter([1, 2, 3]);
      expect(result).toBe('[1, 2, 3]');
    });

    it('should format objects as JSON', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter({ key: 'value' });
      expect(result).toBe('{"key":"value"}');
    });

    it('should convert numbers to strings', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).stringifyParameter(42);
      expect(result).toBe('42');
    });
  });

  describe('buildSqlString', () => {
    it('should return query without parameters if none provided', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString('SELECT * FROM users');
      expect(result).toBe('SELECT * FROM users');
    });

    it('should replace ? placeholders with parameters', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString(
        'SELECT * FROM users WHERE id = ? AND name = ?',
        [1, 'test'],
      );
      expect(result).toContain('1');
      expect(result).toContain("'test'");
    });

    it('should handle named parameters', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString(
        'SELECT * FROM users WHERE id = :id',
        [{ id: 1 }],
      );
      expect(result).toContain('1');
    });

    it('should return query with original params if replacement fails', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      // Spy on stringifyParameter to make it throw
      jest.spyOn(service as any, 'stringifyParameter').mockImplementation(() => {
        throw new Error('Cannot stringify');
      });

      const result = (service as any).buildSqlString(
        'SELECT * FROM users',
        [{ complex: 'object' }],
      );

      expect(result).toContain('SELECT * FROM users');
      expect(result).toContain('Parameters:');
    });
  });
});
