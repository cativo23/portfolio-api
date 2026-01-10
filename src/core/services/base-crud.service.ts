import { Injectable, Logger } from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { NotFoundException } from '../exceptions/not-found.exception';
import { DeleteResponseDto } from '@projects/dto/delete-response.dto';

/**
 * Base CRUD service for common database operations
 *
 * This abstract class eliminates duplication of common CRUD operations across services by:
 * 1. Providing default implementations for create, findOne, update, and remove
 * 2. Handling common patterns like NotFoundException and logging
 * 3. Using TypeORM patterns for efficient database operations
 *
 * Implementation choice: We create this base class instead of repeating code because:
 * 1. DRY principle - eliminates code duplication
 * 2. Consistency - all CRUD operations behave the same way
 * 3. Maintainability - changes to CRUD logic only need to be made once
 * 4. Type safety - uses generics for type-safe operations
 *
 * @template TEntity The entity type (e.g., Project, Contact)
 * @template TCreateDto The DTO type for creating entities (e.g., CreateProjectDto, CreateContactDto)
 * @template TUpdateDto The DTO type for updating entities (e.g., UpdateProjectDto)
 */
@Injectable()
export abstract class BaseCrudService<
  TEntity extends { id: number },
  TCreateDto,
  TUpdateDto,
> {
  protected abstract readonly repository: Repository<TEntity>;
  protected abstract readonly logger: Logger;

  /**
   * Get the entity name for logging purposes (e.g., 'Project', 'Contact')
   */
  protected abstract getEntityName(): string;

  /**
   * Creates a new entity
   *
   * @param createDto - DTO containing entity data
   * @returns Promise resolving to the created entity
   */
  async create(createDto: TCreateDto): Promise<TEntity> {
    const entity = this.repository.create(createDto as DeepPartial<TEntity>);
    const savedEntity = await this.repository.save(entity);
    this.logger.log(
      `${this.getEntityName()} created with ID ${savedEntity.id}`,
    );
    return savedEntity;
  }

  /**
   * Retrieves a single entity by its ID
   *
   * @param id - The ID of the entity to retrieve
   * @returns Promise resolving to the entity
   * @throws NotFoundException if the entity doesn't exist
   */
  async findOne(id: number): Promise<TEntity> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

    if (!entity) {
      this.logger.warn(`${this.getEntityName()} with ID ${id} not found`);
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }

    this.logger.log(
      `Found ${this.getEntityName().toLowerCase()} with ID ${id}`,
    );
    return entity;
  }

  /**
   * Updates an existing entity by its ID
   *
   * @param id - The ID of the entity to update
   * @param updateDto - DTO containing the fields to update
   * @returns Promise resolving to the updated entity
   * @throws NotFoundException if the entity doesn't exist
   */
  async update(id: number, updateDto: TUpdateDto): Promise<TEntity> {
    // Check if the entity exists
    const existingEntity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

    if (!existingEntity) {
      this.logger.warn(`${this.getEntityName()} with ID ${id} not found`);
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }

    // Merge and save in one operation (efficient pattern)
    const updatedEntity = this.repository.merge(
      existingEntity,
      updateDto as DeepPartial<TEntity>,
    );
    const savedEntity = await this.repository.save(updatedEntity);
    this.logger.log(
      `Updated ${this.getEntityName().toLowerCase()} with ID ${id}`,
    );

    return savedEntity;
  }

  /**
   * Deletes an entity by its ID
   *
   * @param id - The ID of the entity to delete
   * @returns Promise resolving to a standardized response with a success message
   * @throws NotFoundException if the entity doesn't exist
   */
  async remove(id: number): Promise<DeleteResponseDto> {
    // Check if the entity exists
    const existingEntity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

    if (!existingEntity) {
      this.logger.warn(`${this.getEntityName()} with ID ${id} not found`);
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }

    // Delete entity
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      // This should rarely happen if findOne succeeded, but handle it just in case
      this.logger.warn(
        `Failed to delete ${this.getEntityName().toLowerCase()} with ID ${id} - no rows affected`,
      );
      throw new NotFoundException(
        `${this.getEntityName()} with ID ${id} not found`,
      );
    }

    this.logger.log(
      `Deleted ${this.getEntityName().toLowerCase()} with ID ${id}`,
    );
    return DeleteResponseDto.withMessage(
      `${this.getEntityName()} successfully deleted`,
    );
  }
}
