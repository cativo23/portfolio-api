import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from '@projects/entities/project.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  DeleteResponseDto,
} from '@projects/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationUtil } from '@core/utils/pagination.util';
import { BaseCrudService } from '@core/services/base-crud.service';
import { CacheInvalidationService } from '@src/cache/cache-invalidation.service';
import * as sanitizeHtml from 'sanitize-html';

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
 * Allowed HTML tags for content sanitization
 */
const ALLOWED_CONTENT_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
];

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
    private readonly cacheInvalidationService: CacheInvalidationService,
  ) {
    super();
  }

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param content - Raw HTML/Markdown content
   * @returns Sanitized content safe for storage and rendering
   */
  private sanitizeContent(content: string | undefined): string | undefined {
    if (!content) {
      return content;
    }
    return sanitizeHtml(content, {
      allowedTags: ALLOWED_CONTENT_TAGS,
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'title'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
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

  /**
   * Creates a new project and invalidates cache
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Sanitize content before saving to prevent XSS
    const sanitizedDto = {
      ...createProjectDto,
      content: this.sanitizeContent(createProjectDto.content),
    };
    const result = await super.create(sanitizedDto);
    // Safe: invalidateByPrefix never throws (has internal try/catch)
    await this.cacheInvalidationService.invalidateByPrefix('projects');
    return result;
  }

  /**
   * Updates a project and invalidates cache
   */
  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    // Sanitize content before saving to prevent XSS
    const sanitizedDto = {
      ...updateProjectDto,
      content: this.sanitizeContent(updateProjectDto.content),
    };
    const result = await super.update(id, sanitizedDto);
    // Safe: invalidateByPrefix never throws (has internal try/catch)
    await this.cacheInvalidationService.invalidateByPrefix('projects');
    return result;
  }

  /**
   * Removes a project and invalidates cache
   */
  async remove(id: number): Promise<DeleteResponseDto> {
    const result = await super.remove(id);
    // Safe: invalidateByPrefix never throws (has internal try/catch)
    await this.cacheInvalidationService.invalidateByPrefix('projects');
    return result;
  }
}
