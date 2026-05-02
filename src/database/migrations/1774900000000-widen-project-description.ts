import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Widen `projects.description` from VARCHAR(255) to TEXT.
 *
 * The Project entity declares description as `@Column({ type: 'text' })` but
 * the original create-table migration (1767058079581) created the column as
 * VARCHAR(255). This drift caused `Data too long for column 'description'`
 * errors in production when posting overviews longer than 255 characters.
 *
 * No data loss: TEXT is strictly wider than VARCHAR(255).
 */
export class WidenProjectDescription1774900000000 implements MigrationInterface {
  name = 'WidenProjectDescription1774900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`description\` TEXT NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting may truncate existing rows. Caller must ensure descriptions
    // already fit within 255 characters before running down.
    await queryRunner.query(
      `ALTER TABLE \`projects\` MODIFY COLUMN \`description\` VARCHAR(255) NOT NULL`,
    );
  }
}
