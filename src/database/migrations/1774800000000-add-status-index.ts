import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add index on status column for query optimization
 */
export class AddStatusIndex1774800000000 implements MigrationInterface {
  name = 'AddStatusIndex1774800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_status\` ON \`projects\` (\`status\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_status\` ON \`projects\``);
  }
}
