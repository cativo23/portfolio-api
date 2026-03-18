import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for API information response
 */
export class ApiInfoResponseDto {
  @ApiProperty({
    description: 'API name',
    example: 'Portfolio API',
  })
  name: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.3',
  })
  version: string;

  @ApiProperty({
    description: 'API description',
    example: 'RESTful API for managing portfolio projects',
  })
  description: string;

  @ApiProperty({
    description: 'API environment',
    example: 'production',
    enum: ['development', 'production', 'test'],
  })
  environment: string;

  @ApiProperty({
    description: 'API documentation URL',
    example: 'https://api.cativo.dev/docs',
  })
  documentation: string;

  @ApiProperty({
    description: 'Health check endpoint URL',
    example: 'https://api.cativo.dev/health',
  })
  health: string;

  @ApiProperty({
    description: 'API status',
    example: 'operational',
  })
  status: string;

  @ApiProperty({
    description: 'Server timestamp in ISO format',
    example: '2026-01-08T14:00:00.000Z',
  })
  timestamp: string;
}
