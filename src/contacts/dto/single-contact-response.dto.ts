import { ContactResponseDto } from '@contacts/dto/contact-response.dto';
import { SingleResourceResponseDto } from '@core/dto';
import { Contact } from '@contacts/entities/contact.entity';

/**
 * DTO for a single contact response
 *
 * Uses SingleResourceResponseDto base class to eliminate code duplication.
 * Single resource responses don't include pagination metadata.
 */
export class SingleContactResponseDto extends SingleResourceResponseDto<ContactResponseDto> {
  /**
   * Create a SingleContactResponseDto from a Contact entity
   * @param contact Contact entity
   * @returns SingleContactResponseDto
   */
  static fromEntity(contact: Contact): SingleContactResponseDto {
    const contactDto = ContactResponseDto.fromEntity(contact);
    return new SingleContactResponseDto(contactDto);
  }
}
