import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateContactDto,
  ContactsListResponseDto,
  SingleContactResponseDto,
  ContactResponseDto,
  FindAllContactsQueryDto,
} from '@contacts/dto';
import { ContactsService } from '@contacts/contacts.service';
import { AuthGuard } from '@auth/auth.guard';
import { DeleteResponseDto } from '@projects/dto/delete-response.dto';
import { Public } from '@auth/decorators/public.decorator';
import {
  ApiGetSingleResource,
  ApiGetPaginatedList,
  ApiCreateResource,
  ApiUpdateResource,
  ApiDeleteResource,
} from '@core/decorators';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiBody({ type: CreateContactDto })
  @ApiCreateResource(
    201,
    'The contact form has been successfully submitted',
    SingleContactResponseDto,
    ContactResponseDto,
  )
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<SingleContactResponseDto> {
    const contact = await this.contactsService.create(createContactDto);
    return SingleContactResponseDto.fromEntity(contact);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contacts (Admin only)' })
  @ApiGetPaginatedList(
    'Returns a paginated list of contacts',
    ContactsListResponseDto,
  )
  async findAll(
    @Query() query: FindAllContactsQueryDto,
  ): Promise<ContactsListResponseDto> {
    const result = await this.contactsService.findAll({
      page: query.page || 1,
      per_page: query.per_page || 10,
      search: query.search,
      isRead: query.is_read,
    });

    // Transform entities to DTOs
    const contactDtos = result.items.map((contact) =>
      ContactResponseDto.fromEntity(contact),
    );

    // Return standardized response
    return ContactsListResponseDto.fromEntities(
      contactDtos,
      result.page,
      result.per_page,
      result.total,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a contact by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
  @ApiGetSingleResource(
    200,
    'The found contact',
    SingleContactResponseDto,
    ContactResponseDto,
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SingleContactResponseDto> {
    const contact = await this.contactsService.findOne(id);
    return SingleContactResponseDto.fromEntity(contact);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a contact as read (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
  @ApiUpdateResource(
    'The contact has been successfully marked as read',
    SingleContactResponseDto,
    ContactResponseDto,
  )
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SingleContactResponseDto> {
    const contact = await this.contactsService.markAsRead(id);
    return SingleContactResponseDto.fromEntity(contact);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a contact by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
  @ApiDeleteResource(
    'The contact has been successfully deleted',
    DeleteResponseDto,
  )
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResponseDto> {
    return this.contactsService.remove(id);
  }
}
