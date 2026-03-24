import {
  RequestContextDecorator,
  InjectRequestContext,
} from './request-context.decorator';
import { RequestContext } from './request-context.interface';
import { ClsService } from 'nestjs-cls';

describe('RequestContextDecorator', () => {
  it('should be defined', () => {
    expect(RequestContextDecorator).toBeDefined();
    expect(InjectRequestContext).toBe(RequestContextDecorator);
    expect(typeof RequestContextDecorator).toBe('function');
  });

  it('should work as a parameter decorator', () => {
    expect(() => {
      class TestController {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@RequestContextDecorator() _ctx: RequestContext) {
          // Test decorator usage
        }
      }
    }).not.toThrow();
  });

  it('should work with the InjectRequestContext alias', () => {
    expect(() => {
      class TestController {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@InjectRequestContext() _ctx: RequestContext) {
          // Test decorator usage
        }
      }
    }).not.toThrow();
  });
});
