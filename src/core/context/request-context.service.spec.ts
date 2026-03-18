import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from './request-context.service';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from './request-context.interface';

describe('RequestContextService', () => {
  let service: RequestContextService;
  let clsService: ClsService;

  const mockContext: RequestContext = {
    requestId: 'req_123456789abc',
    path: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    timestamp: '2023-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestContextService,
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue(mockContext),
          },
        },
      ],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
    clsService = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContext', () => {
    it('should return request context when available', () => {
      const result = service.getContext();

      expect(result).toEqual(mockContext);
      expect(clsService.get).toHaveBeenCalledWith('requestContext');
    });

    it('should return undefined when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const result = service.getContext();

      expect(result).toBeUndefined();
    });
  });

  describe('getRequestId', () => {
    it('should return request ID from context', () => {
      const result = service.getRequestId();

      expect(result).toBe('req_123456789abc');
    });

    it('should return "unknown" when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const result = service.getRequestId();

      expect(result).toBe('unknown');
    });

    it('should return "unknown" when requestId is not in context', () => {
      (clsService.get as jest.Mock).mockReturnValue({});

      const result = service.getRequestId();

      expect(result).toBe('unknown');
    });
  });

  describe('getPath', () => {
    it('should return path from context', () => {
      const result = service.getPath();

      expect(result).toBe('/test');
    });

    it('should return empty string when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const result = service.getPath();

      expect(result).toBe('');
    });

    it('should return empty string when path is not in context', () => {
      (clsService.get as jest.Mock).mockReturnValue({});

      const result = service.getPath();

      expect(result).toBe('');
    });
  });

  describe('getMethod', () => {
    it('should return method from context', () => {
      const result = service.getMethod();

      expect(result).toBe('GET');
    });

    it('should return empty string when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const result = service.getMethod();

      expect(result).toBe('');
    });
  });

  describe('getIp', () => {
    it('should return IP from context', () => {
      const result = service.getIp();

      expect(result).toBe('127.0.0.1');
    });

    it('should return empty string when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const result = service.getIp();

      expect(result).toBe('');
    });
  });

  describe('getTimestamp', () => {
    it('should return timestamp from context', () => {
      const result = service.getTimestamp();

      expect(result).toBe('2023-01-01T00:00:00Z');
    });

    it('should return current ISO timestamp when context is not available', () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);

      const before = Date.now();
      const result = service.getTimestamp();
      const after = Date.now();
      const resultTimestamp = new Date(result).getTime();

      expect(resultTimestamp).toBeGreaterThanOrEqual(before);
      expect(resultTimestamp).toBeLessThanOrEqual(after);
    });

    it('should return current ISO timestamp when timestamp is not in context', () => {
      (clsService.get as jest.Mock).mockReturnValue({});

      const before = Date.now();
      const result = service.getTimestamp();
      const after = Date.now();
      const resultTimestamp = new Date(result).getTime();

      expect(resultTimestamp).toBeGreaterThanOrEqual(before);
      expect(resultTimestamp).toBeLessThanOrEqual(after);
    });
  });
});
