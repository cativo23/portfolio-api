import {
  RequestContextDecorator,
  InjectRequestContext,
} from './request-context.decorator';
import { RequestContext } from './request-context.interface';

describe('RequestContextDecorator', () => {
  it('should be defined', () => {
    expect(RequestContextDecorator).toBeDefined();
    expect(InjectRequestContext).toBe(RequestContextDecorator);
    expect(typeof RequestContextDecorator).toBe('function');
  });

  /* eslint-disable @typescript-eslint/no-unused-vars */
  it('should work as a parameter decorator', () => {
    expect(() => {
      class TestController {
        test(_ctx: RequestContext) {
          // Test decorator usage
        }
      }
    }).not.toThrow();
  });

  it('should work with the InjectRequestContext alias', () => {
    expect(() => {
      class TestController {
        test(_ctx: RequestContext) {
          // Test decorator usage
        }
      }
    }).not.toThrow();
  });
  /* eslint-enable @typescript-eslint/no-unused-vars */
});
