import { vi, type Mocked } from 'vitest';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticationException } from '@core/exceptions';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeyService: Mocked<ApiKeyService>;
  let mockContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    apiKeyService = {
      validate: vi.fn(),
    } as any;

    guard = new ApiKeyGuard(apiKeyService);

    mockRequest = {
      headers: {},
    };

    mockContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when API key is valid via x-api-key header', async () => {
      mockRequest.headers['x-api-key'] = 'valid-key';
      apiKeyService.validate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(apiKeyService.validate).toHaveBeenCalledWith('valid-key');
    });

    it('should return true when API key is valid via Authorization header (ApiKey prefix)', async () => {
      mockRequest.headers['authorization'] = 'ApiKey valid-key';
      apiKeyService.validate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(apiKeyService.validate).toHaveBeenCalledWith('valid-key');
    });

    it('should handle Authorization header with different casing', async () => {
      mockRequest.headers['Authorization'] = 'apikey valid-key';
      apiKeyService.validate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(apiKeyService.validate).toHaveBeenCalledWith('valid-key');
    });

    it('should throw AuthenticationException when API key is invalid', async () => {
      mockRequest.headers['x-api-key'] = 'invalid-key';
      apiKeyService.validate.mockResolvedValue(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });

    it('should throw AuthenticationException when API key is missing', async () => {
      mockRequest.headers = {};

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
      expect(apiKeyService.validate).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationException when Authorization header has wrong prefix', async () => {
      mockRequest.headers['authorization'] = 'Bearer some-token';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
      expect(apiKeyService.validate).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationException when Authorization header has no prefix', async () => {
      mockRequest.headers['authorization'] = 'some-token';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
      expect(apiKeyService.validate).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationException when Authorization header has more than 2 parts', async () => {
      mockRequest.headers['authorization'] = 'ApiKey key extra';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
      expect(apiKeyService.validate).not.toHaveBeenCalled();
    });

    it('should prefer x-api-key header over Authorization header', async () => {
      mockRequest.headers['x-api-key'] = 'x-api-key-value';
      mockRequest.headers['authorization'] = 'ApiKey auth-header-value';
      apiKeyService.validate.mockResolvedValue(true);

      await guard.canActivate(mockContext);

      expect(apiKeyService.validate).toHaveBeenCalledWith('x-api-key-value');
    });

    it('should use Authorization header when x-api-key is not present', async () => {
      mockRequest.headers['authorization'] = 'ApiKey auth-key';
      apiKeyService.validate.mockResolvedValue(true);

      await guard.canActivate(mockContext);

      expect(apiKeyService.validate).toHaveBeenCalledWith('auth-key');
    });

    it('should handle empty x-api-key header and fall back to Authorization', async () => {
      mockRequest.headers['x-api-key'] = '';
      mockRequest.headers['authorization'] = 'ApiKey valid-key';
      apiKeyService.validate.mockResolvedValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(apiKeyService.validate).toHaveBeenCalledWith('valid-key');
    });

    it('should throw when both headers are missing', async () => {
      mockRequest.headers = {};

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });

    it('should throw when x-api-key is empty and Authorization is missing', async () => {
      mockRequest.headers['x-api-key'] = '';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        AuthenticationException,
      );
    });
  });
});
