import { ApiProperty } from '@nestjs/swagger';

/**
 * Base response DTO that all response DTOs should extend
 */
export class BaseResponseDto {
  /**
   * Status of the response (success or error)
   * @example "success"
   */
  @ApiProperty({
    description: 'Status of the response',
    enum: ['success', 'error'],
    example: 'success',
  })
  status: 'success' | 'error';
}
