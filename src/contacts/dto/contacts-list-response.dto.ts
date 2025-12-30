import { ApiProperty } from '@nestjs/swagger';
import { ContactResponseDto } from './contact-response.dto';
import {
  SuccessResponseDto,
  PaginationMetaDto,
  ResponseMetaDto,
} from '@core/dto';

/**
 * DTO for paginated contacts list response
 */
export class ContactsListResponseDto extends SuccessResponseDto<
  ContactResponseDto[]
> {
  @ApiProperty({
    description: 'List of contacts',
    type: [ContactResponseDto],
  })
  data: ContactResponseDto[];

  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  meta: ResponseMetaDto;

  /**
   * Create a ContactsListResponseDto from an array of Contact entities and pagination metadata
   * @param contacts Array of Contact entities
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
    const totalPages = Math.ceil(totalItems / limit);

    const paginationMeta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    return new SuccessResponseDto(contacts, {
      pagination: paginationMeta,
    }) as ContactsListResponseDto;
  }
}