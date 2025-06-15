import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base entity class that provides common fields for all entities
 *
 * All entity classes extend this abstract class in the application
 * to provide common functionality and fields
 */
export class BaseEntity {
  /**
   * Unique identifier for the entity
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Timestamp when the entity was created.
   * This field is automatically set when the entity is first saved
   */
  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the entity was last updated.
   * This field is automatically updated whenever the entity is saved
   */
  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt!: Date;

  /**
   * Timestamp when the entity was soft-deleted
   * This field is set when the entity is deleted using soft delete
   */
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt!: Date;
}
