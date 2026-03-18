import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1767116639651 implements MigrationInterface {
  name = 'Migration1767116639651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` ADD \`techStack\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projects\` DROP COLUMN \`techStack\``,
    );
  }
}
