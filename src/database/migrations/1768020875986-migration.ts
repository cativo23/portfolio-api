import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768020875986 implements MigrationInterface {
  name = 'Migration1768020875986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\` (\`isFeatured\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_4a38e9851744414bbe8142157f\` ON \`projects\` (\`createdAt\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_752866c5247ddd34fd05559537\` ON \`contacts\` (\`email\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_bb49232125fc4faca0bd73c1ce\` ON \`contacts\` (\`isRead\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_d85a678bac9a6dfaa3be9603fb\` ON \`contacts\` (\`createdAt\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_d85a678bac9a6dfaa3be9603fb\` ON \`contacts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bb49232125fc4faca0bd73c1ce\` ON \`contacts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_752866c5247ddd34fd05559537\` ON \`contacts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4a38e9851744414bbe8142157f\` ON \`projects\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\``,
    );
  }
}
