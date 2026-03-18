import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheInvalidationService } from './cache-invalidation.service';
import type { RedisConfig } from '@config/configuration.types';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.getOrThrow<RedisConfig>('redis');
        const store = await redisStore({
          socket: {
            host: redis.host,
            port: redis.port,
          },
          password: redis.password,
        });
        return {
          store,
          ttl: redis.ttlSeconds * 1000,
        };
      },
    }),
  ],
  providers: [CacheInvalidationService],
  exports: [CacheInvalidationService],
})
export class RedisCacheModule {}
