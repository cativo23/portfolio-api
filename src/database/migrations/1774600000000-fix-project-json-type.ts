import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to fix JSON column type mismatch
 * Changes techStack and features columns from TEXT (simple-json) to native MySQL JSON
 */
export class FixProjectJsonType1774600000000 implements MigrationInterface {
  name = 'FixProjectJsonType1774600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert techStack from TEXT to JSON
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`techStack\` JSON NULL`,
    );

    // Convert features from TEXT to JSON
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`features\` JSON NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert features from JSON to TEXT
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`features\` TEXT NULL`,
    );

    // Revert techStack from JSON to TEXT
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`techStack\` TEXT NULL`,
    );
  }
}
