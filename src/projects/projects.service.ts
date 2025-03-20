import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';

interface FindAllOptions {
  page: number;
  per_page: number;
  search?: string;
  isFeatured?: boolean|undefined;
}

@Injectable()
export class ProjectsService {

  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) { }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      const project = this.projectsRepository.create(createProjectDto);
      const savedProject = await this.projectsRepository.save(project);
      this.logger.log(`Project created with ID ${savedProject.id}`);
      return savedProject;
    } catch (error) {
      this.logger.error('Error creating project', error.stack);
      throw new InternalServerErrorException('Error creating project');
    }
  }

  async findAll(options: FindAllOptions): Promise<{ data: Project[]; total: number }> {
    const { page, per_page, search, isFeatured } = options;
    const query = this.projectsRepository.createQueryBuilder('projects');
    // Filtering by search
    if (search) {
      query.andWhere('projects.title LIKE :search OR projects.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filtering by isFeatured
    if (typeof isFeatured !== 'undefined') {
      query.andWhere('projects.isFeatured = :isFeatured', { isFeatured });
    }

    // Pagination
    query.skip((page - 1) * per_page).take(per_page);

    // Execute query and get [data, total count]
    const [data, total] = await query.getManyAndCount();

    this.logger.log(`Found ${total} projects`);

    return {
      data,
      total,
    };
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: id },
    });
    if (!project) {
      this.logger.warn(`Project with ID ${id} not found`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    this.logger.log(`Found project with ID ${id}`);
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectsRepository.update(id, updateProjectDto);
    this.logger.log(`Updated project with ID ${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Project with ID ${id} not found`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    this.logger.log(`Deleted project with ID ${id}`);
    return true;
  }
}
