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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
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
  ProjectResponseDto,
} from './dto';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@auth/auth.guard';
import { JwtOrApiKeyGuard } from '@core/jwt-or-api-key.guard';
import { ValidationPipe } from '@core/pipes';
import {
  ApiGetSingleResource,
  ApiGetPaginatedList,
  ApiCreateResource,
  ApiUpdateResource,
  ApiDeleteResource,
} from '@core/decorators';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

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
  @ApiGetPaginatedList(
    'Returns a paginated list of projects',
    ProjectsListResponseDto,
  )
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

    const result = await this.projectsService.findAll({
      page: pageNumber,
      per_page: perPage,
      search,
      isFeatured: isFeatured,
    });

    // Transform entities to DTOs
    const projectDtos = result.items.map((project) =>
      ProjectResponseDto.fromEntity(project),
    );

    // Return standardized response
    return ProjectsListResponseDto.fromEntities(
      projectDtos,
      result.page,
      result.per_page,
      result.total,
    );
  }

  @Get(':id')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiGetSingleResource(
    200,
    'The found project',
    SingleProjectResponseDto,
    ProjectResponseDto,
  )
  async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.findOne(+id);
    return SingleProjectResponseDto.fromEntity(project);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CreateProjectDto })
  @ApiCreateResource(
    201,
    'The project has been successfully created',
    SingleProjectResponseDto,
    ProjectResponseDto,
  )
  async create(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.create(createProjectDto);
    return SingleProjectResponseDto.fromEntity(project);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project by ID' })
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiUpdateResource(
    'The project has been successfully updated',
    SingleProjectResponseDto,
    ProjectResponseDto,
  )
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.update(+id, updateProjectDto);
    return SingleProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Project ID' })
  @ApiDeleteResource(
    'The project has been successfully deleted',
    DeleteResponseDto,
  )
  async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.projectsService.remove(+id);
  }
}
