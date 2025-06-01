import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponseDto,
  ProjectsListResponseDto,
  SingleProjectResponseDto,
  DeleteResponseDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException } from '@core/exceptions/internal-server.exception';
import { NotFoundException } from '@core/exceptions/not-found.exception';

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
   * @returns Promise resolving to the created project wrapped in a standardized response
   * @throws InternalServerException if there's an error during creation
   */
  async create(
    createProjectDto: CreateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    try {
      const project = this.projectsRepository.create(createProjectDto);
      const savedProject = await this.projectsRepository.save(project);
      this.logger.log(`Project created with ID ${savedProject.id}`);
      return SingleProjectResponseDto.fromEntity(savedProject);
    } catch (error) {
      this.logger.error('Error creating project', error.stack);
      throw new InternalServerException('Error creating project');
    }
  }

  /**
   * Retrieves a paginated list of projects with optional filtering
   *
   * @param options - Object containing pagination, search, and filtering options
   * @returns Promise resolving to a list of projects with pagination metadata
   * @throws InternalServerException if there's an error during retrieval
   */
  async findAll(options: FindAllOptions): Promise<ProjectsListResponseDto> {
    try {
      const { page, per_page, search, isFeatured } = options;
      const query = this.projectsRepository.createQueryBuilder('projects');

      // Filtering by search
      if (search) {
        query.andWhere(
          'projects.title LIKE :search OR projects.description LIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      // Filtering by isFeatured
      if (typeof isFeatured !== 'undefined') {
        query.andWhere('projects.isFeatured = :isFeatured', { isFeatured });
      }

      // Add ordering
      query.orderBy('projects.createdAt', 'DESC');

      // Pagination
      query.skip((page - 1) * per_page).take(per_page);

      // Execute the query and get [data, total count]
      const [projects, totalItems] = await query.getManyAndCount();

      this.logger.log(`Found ${totalItems} projects`);

      // Convert entities to DTOs
      const projectDtos = projects.map((project) =>
        ProjectResponseDto.fromEntity(project),
      );

      // Return standardized response
      return ProjectsListResponseDto.fromEntities(
        projectDtos,
        page,
        per_page,
        totalItems,
      );
    } catch (error) {
      this.logger.error('Error finding projects', error.stack);
      throw new InternalServerException('Error finding projects');
    }
  }

  /**
   * Retrieves a single project by its ID
   *
   * @param id - The ID of the project to retrieve
   * @returns Promise resolving to the project wrapped in a standardized response
   * @throws NotFoundException if the project doesn't exist
   * @throws InternalServerException if there's an error during retrieval
   */
  async findOne(id: number): Promise<SingleProjectResponseDto> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { id: id },
      });

      if (!project) {
        this.logger.warn(`Project with ID ${id} not found`);
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      this.logger.log(`Found project with ID ${id}`);
      return SingleProjectResponseDto.fromEntity(project);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding project with ID ${id}`, error.stack);
      throw new InternalServerException(`Error finding project with ID ${id}`);
    }
  }

  /**
   * Updates an existing project by its ID
   *
   * @param id - The ID of the project to update
   * @param updateProjectDto - Data transfer object containing the fields to update
   * @returns Promise resolving to the updated project wrapped in a standardized response
   * @throws NotFoundException if the project doesn't exist
   * @throws InternalServerException if there's an error during update
   */
  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    try {
      // Check if the project exists
      const existingProject = await this.projectsRepository.findOne({
        where: { id },
      });

      if (!existingProject) {
        this.logger.warn(`Project with ID ${id} not found`);
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Update project
      await this.projectsRepository.update(id, updateProjectDto);
      this.logger.log(`Updated project with ID ${id}`);

      // Get the updated project
      const updatedProject = await this.projectsRepository.findOne({
        where: { id },
      });

      return SingleProjectResponseDto.fromEntity(updatedProject);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating project with ID ${id}`, error.stack);
      throw new InternalServerException(`Error updating project with ID ${id}`);
    }
  }

  /**
   * Deletes a project by its ID
   *
   * @param id - The ID of the project to delete
   * @returns Promise resolving to a standardized response with a success message
   * @throws NotFoundException if the project doesn't exist
   * @throws InternalServerException if there's an error during deletion
   */
  async remove(id: number): Promise<DeleteResponseDto> {
    try {
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
        this.logger.error(`Failed to delete project with ID ${id}`);
        throw new InternalServerException(
          `Failed to delete project with ID ${id}`,
        );
      }

      this.logger.log(`Deleted project with ID ${id}`);
      return DeleteResponseDto.withMessage('Project successfully deleted');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting project with ID ${id}`, error.stack);
      throw new InternalServerException(`Error deleting project with ID ${id}`);
    }
  }
}
