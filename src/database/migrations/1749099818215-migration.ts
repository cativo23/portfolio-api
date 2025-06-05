import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1749099818215 implements MigrationInterface {
    name = 'Migration1749099818215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` text NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_2117ba29bd245f2b53c42f429c\` ON \`projects\` (\`title\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\` (\`isFeatured\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_projects_title_is_featured\` ON \`projects\` (\`title\`, \`isFeatured\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_projects_title_is_featured\` ON \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_2117ba29bd245f2b53c42f429c\` ON \`projects\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` varchar(255) NOT NULL`);
    }

}
