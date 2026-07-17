import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add the curated "problem → role → outcome" spine fields to
 * the projects table, used to replace the raw README dump on project detail
 * pages with a recruiter-skimmable summary.
 */
export class AddProjectSpineFields1776000000000 implements MigrationInterface {
  name = 'AddProjectSpineFields1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`problem\` TEXT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`role\` TEXT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD COLUMN \`outcome\` TEXT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`outcome\``);
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`role\``);
    await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`problem\``);
  }
}
