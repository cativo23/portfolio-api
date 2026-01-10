import { Test, TestingModule } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global-exception.filter';
import { RequestContextService } from '@core/context/request-context.service';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { BaseException, NotFoundException, AuthenticationException } from './';
import { ErrorResponseDto, ErrorCode } from '@core/dto';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let requestContextService: RequestContextService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: ArgumentsHost;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    loggerErrorSpy = jest
      .spyOn(require('@nestjs/common').Logger.prototype, 'error')
      .mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        {
          provide: RequestContextService,
          useValue: {
            getRequestId: jest.fn().mockReturnValue('req_123'),
            getPath: jest.fn().mockReturnValue('/test'),
            getTimestamp: jest.fn().mockReturnValue('2023-01-01T00:00:00Z'),
          },
        },
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle BaseException correctly', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          request_id: 'req_123',
          error: expect.objectContaining({
            code: ErrorCode.RESOURCE_NOT_FOUND,
            message: 'Resource not found',
            path: '/test',
            timestamp: '2023-01-01T00:00:00Z',
          }),
        }),
      );
    });

    it('should handle HttpException with BAD_REQUEST status', () => {
      const exception = new HttpException(
        'Bad request',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          request_id: 'req_123',
          error: expect.objectContaining({
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Bad request',
          }),
        }),
      );
    });

    it('should handle HttpException with UNAUTHORIZED status', () => {
      const exception = new HttpException(
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.AUTHENTICATION_ERROR,
          }),
        }),
      );
    });

    it('should handle HttpException with FORBIDDEN status', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.AUTHORIZATION_ERROR,
          }),
        }),
      );
    });

    it('should handle HttpException with NOT_FOUND status', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.RESOURCE_NOT_FOUND,
          }),
        }),
      );
    });

    it('should handle HttpException with CONFLICT status', () => {
      const exception = new HttpException('Conflict', HttpStatus.CONFLICT);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.CONFLICT_ERROR,
          }),
        }),
      );
    });

    it('should handle HttpException with array message', () => {
      const exception = new HttpException(
        { message: ['Error 1', 'Error 2'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { errors: ['Error 1', 'Error 2'] },
          }),
        }),
      );
    });

    it('should handle generic Error', () => {
      const exception = new Error('Generic error');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          request_id: 'req_123',
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: expect.stringContaining('unexpected error'),
          }),
        }),
      );
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should handle unknown exception type', () => {
      const exception = { someProperty: 'value' };

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_SERVER_ERROR,
          }),
        }),
      );
    });

    it('should use request.url as fallback path when context path is empty', () => {
      (requestContextService.getPath as jest.Mock).mockReturnValue('');
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            path: '/test',
          }),
        }),
      );
    });

    it('should log exceptions with request context', () => {
      const exception = new Error('Test error');
      exception.stack = 'Error stack trace';

      filter.catch(exception, mockHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[req_123]'),
        'Error stack trace',
      );
    });
  });
});
