import {
  RequestContextDecorator,
  InjectRequestContext,
} from './request-context.decorator';
import { RequestContext } from './request-context.interface';

describe('RequestContextDecorator', () => {
  beforeEach(() => {
    // Setup for decorator tests
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestController {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@RequestContextDecorator() _ctx: RequestContext) {
          // Test decorator usage
        }
      }
    }).not.toThrow();
  });
});
