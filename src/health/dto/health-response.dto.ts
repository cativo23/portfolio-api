import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==========================================
// BASE TYPES (must be declared first)
// ==========================================

/**
 * Simplified health status for a single component
 */
class ComponentStatusDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';
}

/**
 * CPU usage information
 */
class CpuUsageDto {
  @ApiProperty({ description: 'User CPU time in microseconds' })
  user: number;

  @ApiProperty({ description: 'System CPU time in microseconds' })
  system: number;
}

/**
 * Memory usage information
 */
class MemoryUsageDto {
  @ApiProperty({ description: 'Resident Set Size in bytes' })
  rss: number;

  @ApiProperty({ description: 'Total heap size in bytes' })
  heapTotal: number;

  @ApiProperty({ description: 'Used heap size in bytes' })
  heapUsed: number;

  @ApiProperty({ description: 'External memory in bytes' })
  external: number;
}

// ==========================================
// COMPONENT HEALTH DTOS
// ==========================================

export class DatabaseHealthDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiPropertyOptional({ description: 'Error message if down' })
  message?: string;

  @ApiPropertyOptional({ description: 'Connection latency in ms' })
  latency?: number;
}

export class RedisHealthDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiPropertyOptional({ description: 'Error message if down' })
  message?: string;

  @ApiPropertyOptional({ description: 'Connection latency in ms' })
  latency?: number;
}

export class MemoryHealthDetailDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ description: 'Used memory in bytes' })
  used: number;

  @ApiProperty({ description: 'Total memory in bytes' })
  total: number;

  @ApiProperty({ description: 'Memory usage percentage' })
  usagePercent: number;

  @ApiPropertyOptional({ description: 'Warning message if usage is critical' })
  message?: string;
}

export class DiskHealthDetailDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ description: 'Used disk space in bytes' })
  used: number;

  @ApiProperty({ description: 'Total disk space in bytes' })
  total: number;

  @ApiProperty({ description: 'Disk usage percentage' })
  usagePercent: number;

  @ApiPropertyOptional({ description: 'Warning message if usage is critical' })
  message?: string;
}

// ==========================================
// COMPOSITE DTOS
// ==========================================

/**
 * Simplified health components
 */
export class HealthComponentsDto {
  @ApiProperty({ type: ComponentStatusDto })
  database: { status: 'up' | 'down' };

  @ApiProperty({ type: ComponentStatusDto })
  redis: { status: 'up' | 'down' };

  @ApiProperty({ type: ComponentStatusDto })
  memory: { status: 'up' | 'down' };

  @ApiProperty({ type: ComponentStatusDto })
  disk: { status: 'up' | 'down' };
}

/**
 * Detailed component health information
 */
export class HealthComponentsDetailDto {
  @ApiProperty({
    description: 'Database connection health',
    type: () => DatabaseHealthDto,
  })
  database: DatabaseHealthDto;

  @ApiProperty({
    description: 'Redis connection health',
    type: () => RedisHealthDto,
  })
  redis: RedisHealthDto;

  @ApiProperty({
    description: 'Memory health',
    type: () => MemoryHealthDetailDto,
  })
  memory: MemoryHealthDetailDto;

  @ApiProperty({
    description: 'Disk health',
    type: () => DiskHealthDetailDto,
  })
  disk: DiskHealthDetailDto;
}

/**
 * Process information (resource usage only - no sensitive identifiers)
 */
class ProcessInfoDto {
  @ApiProperty({
    description: 'CPU usage',
    type: () => CpuUsageDto,
  })
  cpuUsage: CpuUsageDto;

  @ApiProperty({
    description: 'Memory usage',
    type: () => MemoryUsageDto,
  })
  memoryUsage: MemoryUsageDto;
}

/**
 * Simplified health response data
 */
class HealthDataDto {
  @ApiProperty({
    description: 'Overall health status',
    enum: ['ok', 'degraded', 'error'],
  })
  status: 'ok' | 'degraded' | 'error';

  @ApiProperty({ description: 'ISO 8601 timestamp' })
  timestamp: string;

  @ApiProperty({
    description: 'Component health status (simplified)',
    type: () => HealthComponentsDto,
  })
  components: HealthComponentsDto;
}

// ==========================================
// MAIN RESPONSE DTOS (exported)
// ==========================================

/**
 * Simplified health response - wrapped in standard API format
 */
export class HealthResponseDto {
  @ApiProperty({ enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiProperty({ description: 'Unique request ID' })
  request_id: string;

  @ApiProperty({
    description: 'Health data',
    type: () => HealthDataDto,
  })
  data: HealthDataDto;
}

/**
 * Extended health information with application metrics
 */
export class DetailedHealthResponseDto {
  @ApiProperty({
    description: 'Overall health status',
    enum: ['ok', 'degraded', 'error'],
  })
  status: 'ok' | 'degraded' | 'error';

  @ApiProperty({ description: 'Application version' })
  version: string;

  @ApiProperty({ description: 'Environment name' })
  environment: string;

  @ApiProperty({ description: 'ISO 8601 timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Uptime in seconds' })
  uptime: number;

  @ApiProperty({
    description: 'Process information',
    type: () => ProcessInfoDto,
  })
  process: ProcessInfoDto;

  @ApiProperty({
    description: 'Component health details',
    type: () => HealthComponentsDetailDto,
  })
  components: HealthComponentsDetailDto;
}

/**
 * Liveness probe response
 */
export class LivenessResponseDto {
  @ApiProperty({ enum: ['ok', 'error'] })
  status: 'ok' | 'error';

  @ApiProperty({ description: 'ISO 8601 timestamp' })
  timestamp: string;
}

/**
 * Readiness probe response
 */
export class ReadinessResponseDto {
  @ApiProperty({ enum: ['ok', 'error'] })
  status: 'ok' | 'error';

  @ApiProperty({ description: 'ISO 8601 timestamp' })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Failed dependencies',
    type: [String],
  })
  failedDependencies?: string[];
}
