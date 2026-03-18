import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    apiKeyService = {
      validate: jest.fn(),
    } as any;
    guard = new ApiKeyGuard(apiKeyService);
  });

  it('should throw if no x-api-key header', async () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    };
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should throw if key is invalid', async () => {
    (apiKeyService.validate as jest.Mock).mockResolvedValue(false);
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': 'bad' } }),
      }),
    };
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should return true if key is valid', async () => {
    (apiKeyService.validate as jest.Mock).mockResolvedValue(true);
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': 'good' } }),
      }),
    };
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
