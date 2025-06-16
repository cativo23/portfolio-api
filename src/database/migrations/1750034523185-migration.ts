import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750034523185 implements MigrationInterface {
    name = 'Migration1750034523185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_2117ba29bd245f2b53c42f429c\` ON \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_projects_title_is_featured\` ON \`projects\``);
        await queryRunner.query(`CREATE TABLE \`api_keys\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`key\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_e42cf55faeafdcce01a82d2484\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` text NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_e42cf55faeafdcce01a82d2484\` ON \`api_keys\``);
        await queryRunner.query(`DROP TABLE \`api_keys\``);
        await queryRunner.query(`CREATE INDEX \`IDX_projects_title_is_featured\` ON \`projects\` (\`title\`, \`isFeatured\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_70beb93e3ed60432944f532ebd\` ON \`projects\` (\`isFeatured\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2117ba29bd245f2b53c42f429c\` ON \`projects\` (\`title\`)`);
    }

}
