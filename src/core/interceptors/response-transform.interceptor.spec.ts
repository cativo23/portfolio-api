import { Test, TestingModule } from '@nestjs/testing';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { RequestContextService } from '@core/context/request-context.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { SuccessResponseDto } from '@core/dto';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;
  let requestContextService: RequestContextService;
  let mockContext: ExecutionContext;
  let mockHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseTransformInterceptor,
        {
          provide: RequestContextService,
          useValue: {
            getRequestId: vi.fn().mockReturnValue('req_123456789abc'),
          },
        },
      ],
    }).compile();

    interceptor = module.get<ResponseTransformInterceptor<any>>(
      ResponseTransformInterceptor,
    );
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );

    mockContext = {
      switchToHttp: vi.fn(),
    } as unknown as ExecutionContext;

    mockHandler = {
      handle: vi.fn(),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should wrap plain data in SuccessResponseDto', async () => {
      const plainData = { id: 1, name: 'Test' };
      (mockHandler.handle as Mock).mockReturnValue(of(plainData));

      const result = await firstValueFrom(
        interceptor.intercept(mockContext, mockHandler),
      );

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.status).toBe('success');
      expect(result.data).toEqual(plainData);
      expect(result.request_id).toBe('req_123456789abc');
      expect(requestContextService.getRequestId).toHaveBeenCalled();
    });

    it('should preserve existing SuccessResponseDto and add request_id if missing', async () => {
      const existingResponse = new SuccessResponseDto({ id: 1 });
      (existingResponse as any).request_id = undefined;
      (mockHandler.handle as Mock).mockReturnValue(of(existingResponse));

      const result = await firstValueFrom(
        interceptor.intercept(mockContext, mockHandler),
      );

      expect(result).toBe(existingResponse);
      expect(result.request_id).toBe('req_123456789abc');
    });

    it('should preserve existing SuccessResponseDto with request_id unchanged', async () => {
      const existingResponse = new SuccessResponseDto({ id: 1 });
      (existingResponse as any).request_id = 'req_existing';
      (mockHandler.handle as Mock).mockReturnValue(of(existingResponse));

      const result = await firstValueFrom(
        interceptor.intercept(mockContext, mockHandler),
      );

      expect(result).toBe(existingResponse);
      expect(result.request_id).toBe('req_existing');
    });

    it('should handle error response DTOs', async () => {
      const errorResponse = {
        status: 'error',
        error: { code: 'TEST_ERROR', message: 'Test error' },
      };
      (errorResponse as any).request_id = undefined;
      (mockHandler.handle as Mock).mockReturnValue(of(errorResponse));

      const result = await firstValueFrom(
        interceptor.intercept(mockContext, mockHandler),
      );

      expect(result).toBe(errorResponse);
      expect((result as any).request_id).toBe('req_123456789abc');
    });

    it('should handle null data', async () => {
      (mockHandler.handle as Mock).mockReturnValue(of(null));

      const result = await firstValueFrom(
        interceptor.intercept(mockContext, mockHandler),
      );

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.status).toBe('success');
      expect(result.data).toBeNull();
      expect(result.request_id).toBe('req_123456789abc');
    });
  });
});
