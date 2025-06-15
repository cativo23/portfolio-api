import { ConfigService } from '@nestjs/config';

/**
 * Factory function that creates JWT configuration options
 *
 * This function is used by the JwtModule to configure JWT token generation.
 * It reads the JWT_SECRET and JWT_EXPIRES_IN environment variables to set
 * the secret key and token expiration time.
 *
 * @param configService - The NestJS ConfigService for accessing environment variables
 * @returns JWT module configuration object with secret and sign options
 * @throws Error if required environment variables are missing
 */
export async function jwtConfigFactory(configService: ConfigService) {
  return {
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') + 's',
    },
  };
}
