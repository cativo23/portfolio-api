import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      // cache-manager v7 wraps stores in Keyv instances
      // Keyv.store gives the KeyvAdapter, which has _cache pointing to the original store
      // cache-manager-redis-yet store exposes the Redis client
      const stores = this.cacheManager.stores;

      for (const keyv of stores) {
        const adapter = (keyv as any).store;
        if (!adapter?._cache?.client) continue;

        const client = adapter._cache.client;
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
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache with prefix "${prefix}": ${error.message}`,
      );
    }
  }
}
