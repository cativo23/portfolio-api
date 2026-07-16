import { ApiProperty } from '@nestjs/swagger';

/**
 * Live infrastructure counts for the public SIGNAL panel.
 * Fields are `null` when the docker proxy cannot be reached.
 */
export class InfraStatsResponseDto {
  @ApiProperty({
    description: 'Number of Traefik-exposed services',
    nullable: true,
    example: 17,
  })
  services: number | null;

  @ApiProperty({
    description: 'Number of distinct docker-compose projects (stacks)',
    nullable: true,
    example: 12,
  })
  stacks: number | null;
}
