import { Test, TestingModule } from '@nestjs/testing';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { RequestContextService } from '../context/request-context.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { SuccessResponseDto } from '../dto';

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
            getRequestId: jest.fn().mockReturnValue('req_123456789abc'),
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
      switchToHttp: jest.fn(),
    } as unknown as ExecutionContext;

    mockHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should wrap plain data in SuccessResponseDto', (done) => {
      const plainData = { id: 1, name: 'Test' };
      (mockHandler.handle as jest.Mock).mockReturnValue(of(plainData));

      interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.status).toBe('success');
        expect(result.data).toEqual(plainData);
        expect(result.request_id).toBe('req_123456789abc');
        expect(requestContextService.getRequestId).toHaveBeenCalled();
        done();
      });
    });

    it('should preserve existing SuccessResponseDto and add request_id if missing', (done) => {
      const existingResponse = new SuccessResponseDto({ id: 1 });
      (existingResponse as any).request_id = undefined;
      (mockHandler.handle as jest.Mock).mockReturnValue(of(existingResponse));

      interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
        expect(result).toBe(existingResponse);
        expect(result.request_id).toBe('req_123456789abc');
        done();
      });
    });

    it('should preserve existing SuccessResponseDto with request_id unchanged', (done) => {
      const existingResponse = new SuccessResponseDto({ id: 1 });
      (existingResponse as any).request_id = 'req_existing';
      (mockHandler.handle as jest.Mock).mockReturnValue(of(existingResponse));

      interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
        expect(result).toBe(existingResponse);
        expect(result.request_id).toBe('req_existing');
        done();
      });
    });

    it('should handle error response DTOs', (done) => {
      const errorResponse = {
        status: 'error',
        error: { code: 'TEST_ERROR', message: 'Test error' },
      };
      (errorResponse as any).request_id = undefined;
      (mockHandler.handle as jest.Mock).mockReturnValue(of(errorResponse));

      interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
        expect(result).toBe(errorResponse);
        expect((result as any).request_id).toBe('req_123456789abc');
        done();
      });
    });

    it('should handle null data', (done) => {
      (mockHandler.handle as jest.Mock).mockReturnValue(of(null));

      interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.status).toBe('success');
        expect(result.data).toBeNull();
        expect(result.request_id).toBe('req_123456789abc');
        done();
      });
    });
  });
});
