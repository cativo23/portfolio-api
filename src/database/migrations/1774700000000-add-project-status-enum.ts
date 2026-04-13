import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add ProjectStatus enum and update column types
 * - Changes status column to use MySQL ENUM type
 * - Updates heroImage column to explicit VARCHAR(255)
 */
export class AddProjectStatusEnum1774700000000 implements MigrationInterface {
  name = 'AddProjectStatusEnum1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change status column to use MySQL ENUM type
    // MySQL creates the enum implicitly when used in ALTER TABLE
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`status\` ENUM('Completed', 'In Progress', 'Maintained') NOT NULL DEFAULT 'Completed'`,
    );

    // Update heroImage to explicit VARCHAR(255)
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`heroImage\` VARCHAR(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert heroImage to VARCHAR
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`heroImage\` VARCHAR(255) NULL`,
    );

    // Revert status column to VARCHAR
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`status\` VARCHAR(255) NOT NULL DEFAULT 'Completed'`,
    );
  }
}
