import { SingleResourceResponseDto } from '@core/dto';

/**
 * DTO for delete operation response
 *
 * Uses SingleResourceResponseDto base class to eliminate code duplication.
 * Delete responses don't include pagination metadata.
 */
export class DeleteResponseDto extends SingleResourceResponseDto<{
  message: string;
}> {
  /**
   * Create a DeleteResponseDto with a success message
   * @param message Success message
   * @returns DeleteResponseDto
   */
  static withMessage(message: string): DeleteResponseDto {
    return new DeleteResponseDto({ message });
  }
}
