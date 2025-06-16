import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectsListResponseDto,
  SingleProjectResponseDto,
  DeleteResponseDto,
} from './dto';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@auth/auth.guard';
import { JwtOrApiKeyGuard } from '@core/jwt-or-api-key.guard';
import { ErrorResponseDto } from '@core/dto';
import { ValidationPipe } from '@core/pipes';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get all projects' })
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
    name: 'is_featured',
    required: false,
    description: 'Filter by featured projects',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of projects',
    type: ProjectsListResponseDto,
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
    @Query('is_featured') is_featured?: string,
  ): Promise<ProjectsListResponseDto> {
    const pageNumber = parseInt(page, 10) || 1;
    const perPage = parseInt(per_page, 10) || 10;
    const isFeatured =
      is_featured === undefined ? undefined : is_featured === 'true';

    return this.projectsService.findAll({
      page: pageNumber,
      per_page: perPage,
      search,
      isFeatured: isFeatured,
    });
  }

  @Get(':id')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found project',
    type: SingleProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
    return this.projectsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The project has been successfully created.',
    type: SingleProjectResponseDto,
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
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The project has been successfully updated.',
    type: SingleProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The project has been successfully deleted.',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.projectsService.remove(+id);
  }
}
