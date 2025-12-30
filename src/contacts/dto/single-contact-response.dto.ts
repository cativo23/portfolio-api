import { ApiProperty } from '@nestjs/swagger';
import { ContactResponseDto } from './contact-response.dto';
import { SuccessResponseDto } from '@core/dto';
import { Contact } from '../entities/contact.entity';

/**
 * DTO for a single contact response
 */
export class SingleContactResponseDto extends SuccessResponseDto<ContactResponseDto> {
  @ApiProperty({
    description: 'Contact data',
    type: ContactResponseDto,
  })
  data: ContactResponseDto;

  /**
   * Create a SingleContactResponseDto from a Contact entity
   * @param contact Contact entity
   * @returns SingleContactResponseDto
   */
  static fromEntity(contact: Contact): SingleContactResponseDto {
    const contactDto = ContactResponseDto.fromEntity(contact);
    return new SuccessResponseDto(contactDto) as SingleContactResponseDto;
  }
}