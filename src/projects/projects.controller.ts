import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  InternalServerErrorException,
  UseGuards,
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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@app/auth/auth.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'is_featured',
    required: false,
    description: 'Filter by featured projects',
  })
  @ApiResponse({ status: 200, description: 'List of projects' })
  findAll(
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('search') search?: string,
    @Query('is_featured') is_featured?: string,
  ) {
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
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'The found project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string) {
    const project = await this.projectsService.remove(+id);
    if (!project) {
      throw new InternalServerErrorException('Project could not be deleted');
    }
    return { message: 'Project successfully deleted' };
  }
}