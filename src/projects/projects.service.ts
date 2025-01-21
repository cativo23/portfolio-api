import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteDateColumn, Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) { }

  create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
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
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
