import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from '@projects/entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from '@projects/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationUtil } from '@core/utils/pagination.util';
import { BaseCrudService } from '@core/services/base-crud.service';

/**
 * Interface defining options for finding projects with pagination, search, and filtering
 */
interface FindAllOptions {
  /** Page number for pagination */
  page: number;
  /** Number of items per page */
  per_page: number;
  /** Optional search term to filter projects by title or description */
  search?: string;
  /** Optional flag to filter projects by featured status */
  isFeatured?: boolean | undefined;
}

/**
 * Service responsible for managing portfolio projects
 *
 * Provides methods for creating, retrieving, updating, and deleting projects
 * Extends BaseCrudService to eliminate code duplication for common CRUD operations
 */
@Injectable()
export class ProjectsService extends BaseCrudService<
  Project,
  CreateProjectDto,
  UpdateProjectDto
> {
  protected readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    protected readonly projectsRepository: Repository<Project>,
  ) {
    super();
  }

  protected get repository(): Repository<Project> {
    return this.projectsRepository;
  }

  protected getEntityName(): string {
    return 'Project';
  }

  /**
   * Retrieves a paginated list of projects with optional filtering
   *
   * @param options - Object containing pagination, search, and filtering options
   * @returns Promise resolving to projects entities with pagination metadata
   */
  async findAll(options: FindAllOptions): Promise<{
    items: Project[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const { page, per_page, search, isFeatured } = options;

    const result = await PaginationUtil.paginate(this.projectsRepository, {
      page,
      per_page,
      search,
      searchFields: ['title', 'description'],
      filters: {
        isFeatured: typeof isFeatured !== 'undefined' ? isFeatured : undefined,
      },
      alias: 'projects',
    });

    this.logger.log(`Found ${result.total} projects`);

    return result;
  }

  // create, findOne, update, and remove methods are inherited from BaseCrudService
}
