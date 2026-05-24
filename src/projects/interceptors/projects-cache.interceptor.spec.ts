import { ExecutionContext } from '@nestjs/common';
import { ProjectsCacheInterceptor } from './projects-cache.interceptor';

describe('ProjectsCacheInterceptor', () => {
  let interceptor: ProjectsCacheInterceptor;

  beforeEach(() => {
    interceptor = new (ProjectsCacheInterceptor as any)(null, null);
  });

  const createMockContext = (
    method: string,
    url: string,
    user?: { id: string },
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, url, user }),
      }),
    }) as any;

  it('should include userId in key for authenticated GET requests', () => {
    const context = createMockContext('GET', '/projects?page=1&per_page=10', {
      id: 'user-42',
    });
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:GET:/projects?page=1&per_page=10:user-42');
  });

  it('should include userId in key for authenticated GET by id', () => {
    const context = createMockContext('GET', '/projects/5', { id: 'user-7' });
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:GET:/projects/5:user-7');
  });

  it('should use "anonymous" in key when request has no authenticated user', () => {
    const context = createMockContext('GET', '/projects?page=1&per_page=10');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe(
      'projects:GET:/projects?page=1&per_page=10:anonymous',
    );
  });

  it('should return undefined for non-GET requests', () => {
    const context = createMockContext('POST', '/projects', { id: 'user-1' });
    const result = (interceptor as any).trackBy(context);
    expect(result).toBeUndefined();
  });
});
