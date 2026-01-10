import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '@core/entities/api-key.entity';
import { ApiKeyController } from '@core/api-key.controller';
import { ApiKeyService } from '@core/api-key.service';

import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey]), AuthModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
