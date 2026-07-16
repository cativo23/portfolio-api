import { ApiProperty } from '@nestjs/swagger';

/**
 * Live infrastructure counts for the public SIGNAL panel.
 * Fields are `null` when the docker proxy cannot be reached.
 */
export class InfraStatsResponseDto {
  @ApiProperty({
    description: 'Number of running containers',
    nullable: true,
    example: 20,
  })
  containers: number | null;

  @ApiProperty({
    description: 'Number of distinct docker-compose projects (stacks)',
    nullable: true,
    example: 12,
  })
  stacks: number | null;
}
