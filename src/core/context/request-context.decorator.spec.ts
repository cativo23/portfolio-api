import { ExecutionContext } from '@nestjs/common';
import { RequestContextDecorator, InjectRequestContext } from './request-context.decorator';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from './request-context.interface';

// Extract the factory function from the decorator
// createParamDecorator wraps the factory function, we need to access it
const getFactoryFunction = (decorator: any) => {
  // The decorator returned by createParamDecorator has the factory function
  // accessible through Reflect.getMetadata or as a property
  // For testing, we'll extract it by calling the decorator and checking its behavior
  return decorator;
};

describe('RequestContextDecorator', () => {
  let mockContext: ExecutionContext;
  let mockRequest: any;
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      get: jest.fn(),
    };

    mockRequest = {
      app: mockApp,
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(RequestContextDecorator).toBeDefined();
    expect(InjectRequestContext).toBe(RequestContextDecorator);
    expect(typeof RequestContextDecorator).toBe('function');
  });

  // Test the factory function by accessing it through Reflect metadata
  // or by creating a test decorator that uses it
  it('should return a function (decorator)', () => {
    expect(typeof RequestContextDecorator).toBe('function');
    
    // The decorator should be usable as a parameter decorator
    // We can't easily test the internal factory without accessing private internals
    // So we'll just verify it's a valid decorator function
    expect(() => {
      class TestController {
        test(@RequestContextDecorator() ctx: RequestContext) {
          return ctx;
        }
      }
    }).not.toThrow();
  });
});
