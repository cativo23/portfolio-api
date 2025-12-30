import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767058079581 implements MigrationInterface {
    name = 'Migration1767058079581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`username\` varchar(500) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`projects\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`shortDescription\` varchar(255) NOT NULL, \`liveUrl\` varchar(255) NULL, \`repoUrl\` varchar(255) NOT NULL, \`isFeatured\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`api_keys\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`key\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_e42cf55faeafdcce01a82d2484\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contacts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`subject\` varchar(255) NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`readAt\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_e42cf55faeafdcce01a82d2484\` ON \`api_keys\``);
        await queryRunner.query(`DROP TABLE \`api_keys\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
