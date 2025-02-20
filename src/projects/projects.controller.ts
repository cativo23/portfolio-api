import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('per_page') per_page: string,
    @Query('search') search?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const perPage = parseInt(per_page, 10) || 10;

    return this.projectsService.findAll({
      page: pageNumber,
      per_page: perPage,
      search,
      isFeatured: isFeatured === undefined ? undefined : isFeatured === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
