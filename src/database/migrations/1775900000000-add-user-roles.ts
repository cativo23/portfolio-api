import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoles1775900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user ADD COLUMN roles TEXT`);
    // Default all existing users to 'user' role
    await queryRunner.query(`UPDATE user SET roles = 'user' WHERE roles IS NULL`);
    // Mark the seeded admin as admin role
    await queryRunner.query(
      `UPDATE user SET roles = 'admin' WHERE username = 'admin'`,
    );
    // Now make it NOT NULL (safe since all rows have a value)
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN roles TEXT NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN roles`);
  }
}
