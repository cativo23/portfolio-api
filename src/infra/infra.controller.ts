import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InfraService } from './infra.service';
import { InfraStatsResponseDto } from './dto/infra-stats-response.dto';

/** Cache window for infra counts — they change rarely, so 5 min is plenty. */
const INFRA_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Public infrastructure signal for the portfolio's SIGNAL panel.
 *
 * Exposes only aggregate counts (running containers, compose stacks) — the same
 * numbers rendered publicly on the site — so there is no new information exposure.
 */
@ApiTags('Infra')
@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  @Get('stats')
  @SkipThrottle()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('infra:stats')
  @CacheTTL(INFRA_CACHE_TTL_MS)
  @ApiOperation({
    summary: 'Live container and stack counts',
    description:
      'Running-container and docker-compose-stack counts derived from the ' +
      'read-only docker-socket-proxy. Fields are null if the source is unreachable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Infrastructure counts retrieved successfully',
    type: InfraStatsResponseDto,
  })
  async stats(): Promise<InfraStatsResponseDto> {
    return this.infraService.getStats();
  }
}
