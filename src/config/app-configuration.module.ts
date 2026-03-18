import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import {
  loadAppConfig,
  loadDatabaseConfig,
  loadJwtConfig,
  loadRedisConfig,
} from '@config/configuration.loaders';
import { validateConfiguration } from '@config/validate-configuration';

export const appConfiguration = registerAs('app', loadAppConfig);
export const databaseConfiguration = registerAs('database', loadDatabaseConfig);
export const redisConfiguration = registerAs('redis', loadRedisConfig);
export const jwtConfiguration = registerAs('jwt', loadJwtConfig);

/**
 * Configuración tipada vía namespaces: `app`, `database`, `redis`, `jwt`.
 *
 * @example
 * ```ts
 * const redis = this.configService.getOrThrow<RedisConfig>('redis');
 * ```
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfiguration,
        databaseConfiguration,
        redisConfiguration,
        jwtConfiguration,
      ],
      validate: validateConfiguration,
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigurationModule {}
