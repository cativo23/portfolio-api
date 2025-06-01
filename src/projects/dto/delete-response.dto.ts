import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from '../../core/dto';

/**
 * DTO for delete operation response
 */
export class DeleteResponseDto extends SuccessResponseDto<{ message: string }> {
  @ApiProperty({
    description: 'Response message',
    example: { message: 'Project successfully deleted' },
  })
  data: { message: string };

  /**
   * Create a DeleteResponseDto with a success message
   * @param message Success message
   * @returns DeleteResponseDto
   */
  static withMessage(message: string): DeleteResponseDto {
    return new SuccessResponseDto({ message }) as DeleteResponseDto;
  }
}
