import { ExecutionContext } from '@nestjs/common';
import { ProjectsCacheInterceptor } from './projects-cache.interceptor';

describe('ProjectsCacheInterceptor', () => {
  let interceptor: ProjectsCacheInterceptor;

  beforeEach(() => {
    interceptor = new (ProjectsCacheInterceptor as any)(null, null);
  });

  const createMockContext = (method: string, url: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
      }),
    }) as any;

  it('should return prefixed key for GET requests', () => {
    const context = createMockContext('GET', '/projects?page=1&per_page=10');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:/projects?page=1&per_page=10');
  });

  it('should return prefixed key for GET by id', () => {
    const context = createMockContext('GET', '/projects/5');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:/projects/5');
  });

  it('should return undefined for non-GET requests', () => {
    const context = createMockContext('POST', '/projects');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBeUndefined();
  });
});
