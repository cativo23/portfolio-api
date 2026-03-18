import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class HashApiKeys1774000000000 implements MigrationInterface {
  name = 'HashApiKeys1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
      throw new Error(
        'API_KEY_SECRET environment variable is required to run this migration',
      );
    }

    // Hash all existing plain-text keys
    const existingKeys = await queryRunner.query(
      'SELECT id, `key` FROM api_keys',
    );

    for (const row of existingKeys) {
      const hashedKey = crypto
        .createHmac('sha256', secret)
        .update(row.key)
        .digest('hex');
      await queryRunner.query(
        'UPDATE api_keys SET `key` = ? WHERE id = ?',
        [hashedKey, row.id],
      );
    }

    // Rename column key -> hashedKey
    await queryRunner.query(
      'ALTER TABLE api_keys CHANGE `key` `hashedKey` varchar(255) NOT NULL',
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'This migration is irreversible. Hashed API keys cannot be restored to plain text.',
    );
  }
}
