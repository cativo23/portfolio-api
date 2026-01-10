import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto, UpdateProjectDto, DeleteResponseDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@core/exceptions/not-found.exception';
import { PaginationUtil } from '@core/utils/pagination.util';

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
 */
@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  /**
   * Creates a new project
   *
   * @param createProjectDto - Data transfer object containing project details
   * @returns Promise resolving to the created project entity
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    const savedProject = await this.projectsRepository.save(project);
    this.logger.log(`Project created with ID ${savedProject.id}`);
    return savedProject;
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
   * Retrieves a single project by its ID
   *
   * @param id - The ID of the project to retrieve
   * @returns Promise resolving to the project entity
   * @throws NotFoundException if the project doesn't exist
   */
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

  /**
   * Updates an existing project by its ID
   *
   * @param id - The ID of the project to update
   * @param updateProjectDto - DTO containing the fields to update
   * @returns Promise resolving to the updated project entity
   * @throws NotFoundException if the project doesn't exist
   */
  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    // Check if the project exists
    const existingProject = await this.projectsRepository.findOne({
      where: { id },
    });

    if (!existingProject) {
      this.logger.warn(`Project with ID ${id} not found`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Merge and save in one operation
    const updatedProject = this.projectsRepository.merge(
      existingProject,
      updateProjectDto,
    );
    const savedProject = await this.projectsRepository.save(updatedProject);
    this.logger.log(`Updated project with ID ${id}`);

    return savedProject;
  }

  /**
   * Deletes a project by its ID
   *
   * @param id - The ID of the project to delete
   * @returns Promise resolving to a standardized response with a success message
   * @throws NotFoundException if the project doesn't exist
   */
  async remove(id: number): Promise<DeleteResponseDto> {
    // Check if a project exists
    const existingProject = await this.projectsRepository.findOne({
      where: { id },
    });

    if (!existingProject) {
      this.logger.warn(`Project with ID ${id} not found`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Delete project
    const result = await this.projectsRepository.delete(id);

    if (result.affected === 0) {
      // This should rarely happen if findOne succeeded, but handle it just in case
      this.logger.warn(
        `Failed to delete project with ID ${id} - no rows affected`,
      );
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    this.logger.log(`Deleted project with ID ${id}`);
    return DeleteResponseDto.withMessage('Project successfully deleted');
  }
}
