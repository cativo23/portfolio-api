import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UsePipes,
    Query,
    UseGuards,
    HttpStatus,
    Patch,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import {
    CreateContactDto,
    ContactsListResponseDto,
    SingleContactResponseDto,
} from './dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from '@auth/auth.guard';
import { ErrorResponseDto } from '@core/dto';
import { DeleteResponseDto } from '@projects/dto/delete-response.dto';
import { ValidationPipe } from '@core/pipes';
import { Public } from '@auth/decorators/public.decorator';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    @Public()
    @UsePipes(new ValidationPipe())
    @ApiOperation({ summary: 'Submit a contact form' })
    @ApiBody({ type: CreateContactDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The contact form has been successfully submitted.',
        type: SingleContactResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    async create(
        @Body() createContactDto: CreateContactDto,
    ): Promise<SingleContactResponseDto> {
        return this.contactsService.create(createContactDto);
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all contacts (Admin only)' })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number',
        example: 1,
    })
    @ApiQuery({
        name: 'per_page',
        required: false,
        description: 'Number of items per page',
        example: 10,
    })
    @ApiQuery({ name: 'search', required: false, description: 'Search term' })
    @ApiQuery({
        name: 'is_read',
        required: false,
        description: 'Filter by read status (true/false)',
        type: Boolean,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of contacts',
        type: ContactsListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    async findAll(
        @Query('page') page?: string,
        @Query('per_page') per_page?: string,
        @Query('search') search?: string,
        @Query('is_read') is_read?: string,
    ): Promise<ContactsListResponseDto> {
        const pageNumber = parseInt(page, 10) || 1;
        const perPage = parseInt(per_page, 10) || 10;
        const isRead =
            is_read === undefined ? undefined : is_read === 'true';

        return this.contactsService.findAll({
            page: pageNumber,
            per_page: perPage,
            search,
            isRead: isRead,
        });
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a contact by ID (Admin only)' })
    @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The found contact',
        type: SingleContactResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Contact not found',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SingleContactResponseDto> {
        return this.contactsService.findOne(id);
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a contact as read (Admin only)' })
    @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The contact has been successfully marked as read.',
        type: SingleContactResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Contact not found',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SingleContactResponseDto> {
        return this.contactsService.markAsRead(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a contact by ID (Admin only)' })
    @ApiParam({ name: 'id', type: Number, description: 'Contact ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The contact has been successfully deleted.',
        type: DeleteResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Contact not found',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<DeleteResponseDto> {
        return this.contactsService.remove(id);
    }
}