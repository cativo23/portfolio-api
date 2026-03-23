import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add rich layout fields to the projects table
 * Adds: content, heroImage, features, status
 */
export class AddProjectRichLayoutFields1774500000000 implements MigrationInterface {
  name = 'AddProjectRichLayoutFields1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add content column for Markdown/HTML case study content
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`content\` TEXT NULL`,
    );

    // Add heroImage column for main hero image URL
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`heroImage\` VARCHAR(255) NULL`,
    );

    // Add features column for JSON array of key features
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`features\` JSON NULL`,
    );

    // Add status column with default value 'Completed'
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`status\` VARCHAR(255) NOT NULL DEFAULT 'Completed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP COLUMN \`features\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP COLUMN \`heroImage\``,
    );
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`content\``);
  }
}
