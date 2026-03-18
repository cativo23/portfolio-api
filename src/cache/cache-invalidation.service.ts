import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      const client = (this.cacheManager as any).stores[0]._cache.client;
      const keys: string[] = [];

      for await (const key of client.scanIterator({
        MATCH: `${prefix}:*`,
        COUNT: 100,
      })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await client.del(keys);
        this.logger.log(
          `Invalidated ${keys.length} cache keys with prefix "${prefix}"`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache with prefix "${prefix}": ${error.message}`,
      );
    }
  }
}
