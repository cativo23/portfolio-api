import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742446989173 implements MigrationInterface {
  name = 'Migration1742446989173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\``,
    );
  }
}
