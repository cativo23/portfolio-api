import { ApiProperty } from '@nestjs/swagger';

/**
 * Base response DTO that all response DTOs should extend
 *
 * Implementation choice: We include request_id in the base class rather than
 * adding it in interceptors/filters because:
 * 1. It ensures type safety and Swagger documentation consistency
 * 2. It makes the response structure explicit in the code
 * 3. It's easier to maintain and understand
 * 4. It follows the principle of explicit over implicit
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

  /**
   * Unique request identifier for tracking and debugging
   * @example "req_88229911"
   */
  @ApiProperty({
    description: 'Unique request identifier for tracking and debugging',
    example: 'req_88229911',
  })
  request_id: string;
}
