import { ConfigService } from '@nestjs/config';
import type { JwtConfig } from '@config/configuration.types';

/**
 * Opciones para JwtModule (secreto y expiración).
 */
export async function jwtConfigFactory(configService: ConfigService) {
  const jwt = configService.getOrThrow<JwtConfig>('jwt');
  if (!jwt.secret?.length) {
    throw new Error('JWT_SECRET is not set');
  }
  return {
    secret: jwt.secret,
    signOptions: {
      expiresIn: `${jwt.expiresInSeconds}s`,
    },
  };
}
