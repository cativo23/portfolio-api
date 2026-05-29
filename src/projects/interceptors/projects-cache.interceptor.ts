import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return undefined;
    }

    const userId: string = request.user?.id ?? 'anonymous';

    return `projects:${request.method}:${request.url}:${userId}`;
  }
}
