import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
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
  FindAllProjectsQueryDto,
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
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiGetPaginatedList(
    'Returns a paginated list of projects',
    ProjectsListResponseDto,
  )
  async findAll(
    @Query() query: FindAllProjectsQueryDto,
  ): Promise<ProjectsListResponseDto> {
    const result = await this.projectsService.findAll({
      page: query.page || 1,
      per_page: query.per_page || 10,
      search: query.search,
      isFeatured: query.is_featured,
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
  @ApiParam({ name: 'id', type: Number, description: 'Project ID' })
  @ApiGetSingleResource(
    200,
    'The found project',
    SingleProjectResponseDto,
    ProjectResponseDto,
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.findOne(id);
    return SingleProjectResponseDto.fromEntity(project);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
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
  @ApiParam({ name: 'id', type: Number, description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiUpdateResource(
    'The project has been successfully updated',
    SingleProjectResponseDto,
    ProjectResponseDto,
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.update(id, updateProjectDto);
    return SingleProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Project ID' })
  @ApiDeleteResource(
    'The project has been successfully deleted',
    DeleteResponseDto,
  )
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResponseDto> {
    return this.projectsService.remove(id);
  }
}
