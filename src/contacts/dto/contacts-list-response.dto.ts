import { ApiProperty } from '@nestjs/swagger';
import { ContactResponseDto } from '@contacts/dto/contact-response.dto';
import { PaginatedResponseDto, ResponseMetaDto } from '@core/dto';

/**
 * DTO for paginated contacts list response
 */
export class ContactsListResponseDto extends PaginatedResponseDto<ContactResponseDto> {
  @ApiProperty({
    description: 'List of contacts',
    type: [ContactResponseDto],
  })
  data: ContactResponseDto[];

  /**
   * Create a ContactsListResponseDto from an array of Contact response DTOs and pagination metadata
   * @param contacts Array of Contact response DTOs
   * @param page Current page number
   * @param limit Items per page
   * @param totalItems Total number of items
   * @returns ContactsListResponseDto
   */
  static fromEntities(
    contacts: ContactResponseDto[],
    page: number,
    limit: number,
    totalItems: number,
  ): ContactsListResponseDto {
    return PaginatedResponseDto.createPaginatedResponse(
      contacts,
      page,
      limit,
      totalItems,
      ContactsListResponseDto,
    );
  }

  /**
   * Constructor for ContactsListResponseDto
   * @param data Array of contact response DTOs
   * @param meta Response metadata containing pagination info
   */
  constructor(data: ContactResponseDto[], meta: ResponseMetaDto) {
    super(data, meta);
  }
}
