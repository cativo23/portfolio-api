import { Test, TestingModule } from '@nestjs/testing';
import { RequestIdMiddleware } from './request-id.middleware';
import { ClsService } from 'nestjs-cls';
import { Request, Response, NextFunction } from 'express';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let clsService: ClsService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestIdMiddleware,
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<RequestIdMiddleware>(RequestIdMiddleware);
    clsService = module.get<ClsService>(ClsService);

    mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should generate a request ID and set it in context', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(clsService.set).toHaveBeenCalledWith(
      'requestContext',
      expect.objectContaining({
        requestId: expect.stringMatching(/^req_[a-f0-9]{12}$/),
        path: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should set X-Request-ID header in response', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      expect.stringMatching(/^req_[a-f0-9]{12}$/),
    );
  });

  it('should call next()', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should use request.ip if available', () => {
    mockRequest = {
      ...mockRequest,
      ip: '192.168.1.1',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(clsService.set).toHaveBeenCalledWith(
      'requestContext',
      expect.objectContaining({
        ip: '192.168.1.1',
      }),
    );
  });

  it('should fall back to socket.remoteAddress if ip is not available', () => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      socket: {
        remoteAddress: '10.0.0.1',
      } as any,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(clsService.set).toHaveBeenCalledWith(
      'requestContext',
      expect.objectContaining({
        ip: '10.0.0.1',
      }),
    );
  });

  it('should use "unknown" if neither ip nor socket.remoteAddress is available', () => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      socket: undefined,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(clsService.set).toHaveBeenCalledWith(
      'requestContext',
      expect.objectContaining({
        ip: 'unknown',
      }),
    );
  });

  it('should generate unique request IDs on multiple calls', () => {
    const requestIds: string[] = [];
    const setSpy = clsService.set as jest.Mock;

    // First call
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    requestIds.push(setSpy.mock.calls[0][1].requestId);

    // Second call
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    requestIds.push(setSpy.mock.calls[1][1].requestId);

    // They should be different
    expect(requestIds[0]).not.toBe(requestIds[1]);
  });
});
