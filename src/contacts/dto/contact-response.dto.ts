import { ApiProperty } from '@nestjs/swagger';
import { Contact } from '@contacts/entities/contact.entity';

/**
 * DTO for contact response
 */
export class ContactResponseDto {
  @ApiProperty({ description: 'Contact ID' })
  id: number;

  @ApiProperty({ description: 'Contact name' })
  name: string;

  @ApiProperty({ description: 'Contact email address' })
  email: string;

  @ApiProperty({ description: 'Contact message' })
  message: string;

  @ApiProperty({ description: 'Optional subject line', required: false })
  subject?: string;

  @ApiProperty({ description: 'Whether the contact has been read' })
  isRead: boolean;

  @ApiProperty({
    description: 'Date when the contact was read',
    required: false,
  })
  readAt?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Create a ContactResponseDto from a Contact entity
   * @param contact Contact entity
   * @returns ContactResponseDto
   */
  static fromEntity(contact: Contact): ContactResponseDto {
    const dto = new ContactResponseDto();
    dto.id = contact.id;
    dto.name = contact.name;
    dto.email = contact.email;
    dto.message = contact.message;
    dto.subject = contact.subject;
    dto.isRead = contact.isRead;
    dto.readAt = contact.readAt;
    dto.createdAt = contact.createdAt;
    dto.updatedAt = contact.updatedAt;
    return dto;
  }
}
