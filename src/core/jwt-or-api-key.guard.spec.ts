import { vi, type Mocked } from 'vitest';
import { JwtOrApiKeyGuard } from './jwt-or-api-key.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@auth/auth.guard';
import { ApiKeyGuard } from '@core/api-key.guard';
import { ModuleRef } from '@nestjs/core';
import { AuthenticationException } from '@core/exceptions';

describe('JwtOrApiKeyGuard', () => {
  let guard: JwtOrApiKeyGuard;
  let moduleRef: Mocked<ModuleRef>;
  let authGuard: Mocked<AuthGuard>;
  let apiKeyGuard: Mocked<ApiKeyGuard>;

  beforeEach(() => {
    authGuard = {
      canActivate: vi.fn(),
    } as any;

    apiKeyGuard = {
      canActivate: vi.fn(),
    } as any;

    moduleRef = {
      get: vi.fn((token) => {
        if ((token as any).name === 'AuthGuard') return authGuard;
        if ((token as any).name === 'ApiKeyGuard') return apiKeyGuard;
        return undefined;
      }),
    } as any;

    guard = new JwtOrApiKeyGuard(moduleRef);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockContext = {} as ExecutionContext;

    it('should return true if AuthGuard succeeds', async () => {
      authGuard.canActivate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(authGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(apiKeyGuard.canActivate).not.toHaveBeenCalled();
    });

    it('should return true if AuthGuard fails but ApiKeyGuard succeeds', async () => {
      authGuard.canActivate.mockRejectedValue(
        new AuthenticationException('Invalid JWT'),
      );
      apiKeyGuard.canActivate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(authGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(apiKeyGuard.canActivate).toHaveBeenCalledTimes(1);
    });

    it('should return false if both AuthGuard and ApiKeyGuard fail', async () => {
      authGuard.canActivate.mockRejectedValue(
        new AuthenticationException('Invalid JWT'),
      );
      apiKeyGuard.canActivate.mockRejectedValue(
        new AuthenticationException('Invalid API key'),
      );

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return false if AuthGuard returns false and ApiKeyGuard returns false', async () => {
      authGuard.canActivate.mockResolvedValue(false);
      apiKeyGuard.canActivate.mockResolvedValue(false);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should re-throw unexpected errors from AuthGuard', async () => {
      const unexpectedError = new Error('Unexpected database error');
      authGuard.canActivate.mockRejectedValue(unexpectedError);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Unexpected database error',
      );
      expect(apiKeyGuard.canActivate).not.toHaveBeenCalled();
    });

    it('should re-throw unexpected errors from ApiKeyGuard', async () => {
      authGuard.canActivate.mockRejectedValue(
        new AuthenticationException('Invalid JWT'),
      );
      const unexpectedError = new Error('Unexpected database error');
      apiKeyGuard.canActivate.mockRejectedValue(unexpectedError);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Unexpected database error',
      );
    });

    it('should handle UnauthorizedException from AuthGuard and try ApiKeyGuard', async () => {
      authGuard.canActivate.mockRejectedValue(
        new UnauthorizedException('JWT invalid'),
      );
      apiKeyGuard.canActivate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false if AuthGuard is not available but ApiKeyGuard succeeds', async () => {
      moduleRef.get = vi
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(apiKeyGuard);
      apiKeyGuard.canActivate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false if ApiKeyGuard is not available and AuthGuard fails', async () => {
      moduleRef.get = vi
        .fn()
        .mockReturnValueOnce(authGuard)
        .mockReturnValueOnce(undefined);
      authGuard.canActivate.mockRejectedValue(
        new AuthenticationException('Invalid JWT'),
      );

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return false if neither guard is available', async () => {
      moduleRef.get = vi.fn().mockReturnValue(undefined);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});
