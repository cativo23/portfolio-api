import { ConfigService } from '@nestjs/config';

export async function jwtConfigFactory(configService: ConfigService) {
  return {
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') + 's',
    },
  };
}
