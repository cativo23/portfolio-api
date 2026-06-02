import { vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmLoggerService } from './typeorm-logger.service';

const createMockConfigService = (logLevels: string[]) => {
  return {
    getOrThrow: vi.fn().mockReturnValue({ logLevels }),
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

    it('never writes parameter values to the log', () => {
      const logSpy = vi
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(vi.fn());
      const service = new TypeOrmLoggerService(createMockConfigService(['query']));

      service.logQuery('INSERT INTO `user`(`password`) VALUES (?)', [
        'SuperSecret123!',
      ]);

      expect(logSpy.mock.calls.flat().join(' ')).not.toContain('SuperSecret123!');
      logSpy.mockRestore();
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

    it('never writes parameter values to the log (no plaintext creds/PII)', () => {
      const errorSpy = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(vi.fn());
      const configService = createMockConfigService(['error']);
      const service = new TypeOrmLoggerService(configService);

      service.logQueryError(
        new Error('Failed'),
        'INSERT INTO `user`(`email`, `password`) VALUES (?, ?)',
        ['victim@example.com', 'SuperSecret123!'],
      );

      const logged = errorSpy.mock.calls.flat().join(' ');
      expect(logged).not.toContain('SuperSecret123!');
      expect(logged).not.toContain('victim@example.com');
      errorSpy.mockRestore();
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

    it('never writes parameter values to the log', () => {
      const warnSpy = vi
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(vi.fn());
      const service = new TypeOrmLoggerService(createMockConfigService(['warn']));

      service.logQuerySlow(5000, 'SELECT * FROM `user` WHERE email = ?', [
        'victim@example.com',
      ]);

      expect(warnSpy.mock.calls.flat().join(' ')).not.toContain(
        'victim@example.com',
      );
      warnSpy.mockRestore();
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

  describe('buildSqlString (parameter redaction)', () => {
    it('returns the query unchanged when no parameters are provided', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString('SELECT * FROM users');
      expect(result).toBe('SELECT * FROM users');
    });

    it('never interpolates positional (?) parameter values', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString(
        'INSERT INTO `user`(`email`, `password`) VALUES (?, ?)',
        ['victim@example.com', 'SuperSecret123!'],
      );

      expect(result).not.toContain('SuperSecret123!');
      expect(result).not.toContain('victim@example.com');
      // Placeholders are preserved so the statement shape stays debuggable
      expect(result).toContain('?');
    });

    it('never interpolates named parameter values', () => {
      const configService = createMockConfigService(['query']);
      const service = new TypeOrmLoggerService(configService);

      const result = (service as any).buildSqlString(
        'SELECT * FROM `user` WHERE email = :email',
        [{ email: 'victim@example.com' }],
      );

      expect(result).not.toContain('victim@example.com');
    });
  });
});
