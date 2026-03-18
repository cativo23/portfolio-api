import { JwtOrApiKeyGuard } from './jwt-or-api-key.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtOrApiKeyGuard', () => {
  let guard: JwtOrApiKeyGuard;
  let moduleRef: any;
  let authGuard: any;
  let apiKeyGuard: any;

  beforeEach(() => {
    authGuard = { canActivate: jest.fn() };
    apiKeyGuard = { canActivate: jest.fn() };
    moduleRef = {
      get: jest.fn((token) => {
        if (token.name === 'AuthGuard') return authGuard;
        if (token.name === 'ApiKeyGuard') return apiKeyGuard;
        return undefined;
      }),
    };
    guard = new JwtOrApiKeyGuard(moduleRef);
  });

  it('should allow if AuthGuard passes', async () => {
    authGuard.canActivate.mockResolvedValue(true);
    apiKeyGuard.canActivate.mockResolvedValue(false);
    const context = {} as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should allow if ApiKeyGuard passes', async () => {
    authGuard.canActivate.mockResolvedValue(false);
    apiKeyGuard.canActivate.mockResolvedValue(true);
    const context = {} as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should deny if both fail', async () => {
    authGuard.canActivate.mockResolvedValue(false);
    apiKeyGuard.canActivate.mockResolvedValue(false);
    const context = {} as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });
});
