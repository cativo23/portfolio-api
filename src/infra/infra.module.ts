import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InfraController } from './infra.controller';
import { InfraService } from './infra.service';

@Module({
  imports: [HttpModule],
  controllers: [InfraController],
  providers: [InfraService],
})
export class InfraModule {}
