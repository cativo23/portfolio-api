# Hash API Keys Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hash API keys with HMAC-SHA256 before storage so plain keys are never persisted in the database.

**Architecture:** HMAC-SHA256 with a global secret (`API_KEY_SECRET` env var). Service hashes on create and validate. Single-query validation via `WHERE hashedKey = ?`. Migration hashes existing plain-text keys.

**Tech Stack:** Node.js crypto (built-in), NestJS ConfigService, TypeORM migrations

**Spec:** `docs/superpowers/specs/2026-03-18-hash-api-keys-design.md`

**Important:** All commands run via `docker compose exec api <command>`.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/core/entities/api-key.entity.ts` | Entity with `hashedKey` column |
| `src/core/api-key.service.ts` | Hash on create/validate, startup validation, remove `revoke(key)` |
| `src/core/api-key.service.spec.ts` | Tests for hashing behavior |
| `src/core/api-key.controller.ts` | Return plain key only on create |
| `src/core/api-key.controller.spec.ts` | Update controller test if exists |
| `.env .example` | Add `API_KEY_SECRET` |
| `src/database/migrations/XXXX-hash-api-keys.ts` | Column rename + hash existing keys |

---

## Chunk 1: Entity, Service, and Tests

### Task 1: Update entity and env vars

**Files:**
- Modify: `src/core/entities/api-key.entity.ts`
- Modify: `.env .example`
- Modify: `.env` (local)

- [ ] **Step 1: Rename `key` to `hashedKey` in entity**

```typescript
// src/core/entities/api-key.entity.ts
import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 255, nullable: false })
  hashedKey: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;
}
```

- [ ] **Step 2: Add `API_KEY_SECRET` to `.env .example`**

Append after the Redis section:

```env
# API Key Hashing
API_KEY_SECRET=your-api-key-secret-change-in-production
```

- [ ] **Step 3: Add `API_KEY_SECRET` to local `.env`**

```env
API_KEY_SECRET=dev-api-key-secret-2026
```

- [ ] **Step 4: Commit**

```bash
git add src/core/entities/api-key.entity.ts ".env .example"
git commit -m "🔒 feat(api-keys): rename key column to hashedKey and add API_KEY_SECRET env var"
```

---

### Task 2: Update ApiKeyService with hashing (TDD)

**Files:**
- Modify: `src/core/api-key.service.ts`
- Modify: `src/core/api-key.service.spec.ts`

- [ ] **Step 1: Write the updated tests**

```typescript
// src/core/api-key.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const TEST_SECRET = 'test-api-key-secret';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repo: Repository<ApiKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'API_KEY_SECRET') return TEST_SECRET;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repo = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an API key and return plainKey + entity', async () => {
      jest.spyOn(repo, 'create').mockImplementation((data: any) => data as any);
      jest.spyOn(repo, 'save').mockImplementation(async (entity: any) => ({
        id: 1,
        ...entity,
      }));

      const result = await service.create('desc');

      expect(result.plainKey).toBeDefined();
      expect(result.plainKey).toHaveLength(64); // 32 bytes hex
      expect(result.apiKey.hashedKey).toBeDefined();
      expect(result.apiKey.hashedKey).not.toBe(result.plainKey);
      expect(result.apiKey.description).toBe('desc');
    });

    it('should hash the key with HMAC-SHA256 using the secret', async () => {
      let savedHashedKey: string;
      jest.spyOn(repo, 'create').mockImplementation((data: any) => data as any);
      jest.spyOn(repo, 'save').mockImplementation(async (entity: any) => {
        savedHashedKey = entity.hashedKey;
        return { id: 1, ...entity };
      });

      const result = await service.create('desc');
      const expectedHash = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(result.plainKey)
        .digest('hex');

      expect(savedHashedKey).toBe(expectedHash);
    });
  });

  describe('validate', () => {
    it('should hash input and find matching key', async () => {
      const plainKey = 'test-plain-key';
      const hashedKey = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(plainKey)
        .digest('hex');

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        hashedKey,
        isActive: true,
      } as any);

      const valid = await service.validate(plainKey);

      expect(valid).toBe(true);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { hashedKey, isActive: true },
      });
    });

    it('should return false for invalid key', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
      const valid = await service.validate('badkey');
      expect(valid).toBe(false);
    });
  });

  describe('revokeById', () => {
    it('should deactivate an API key by id', async () => {
      const updateSpy = jest.spyOn(repo, 'update').mockResolvedValue({} as any);
      await service.revokeById(1);
      expect(updateSpy).toHaveBeenCalledWith({ id: 1 }, { isActive: false });
    });
  });

  describe('startup validation', () => {
    it('should throw if API_KEY_SECRET is missing', async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            ApiKeyService,
            {
              provide: getRepositoryToken(ApiKey),
              useClass: Repository,
            },
            {
              provide: ConfigService,
              useValue: {
                get: jest.fn().mockReturnValue(undefined),
              },
            },
          ],
        }).compile(),
      ).rejects.toThrow('API_KEY_SECRET');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
docker compose exec api npx jest --testPathPattern=api-key.service.spec
```

Expected: FAIL — service doesn't match new behavior yet.

- [ ] **Step 3: Write the implementation**

```typescript
// src/core/api-key.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ApiKey } from '@core/entities/api-key.entity';
import { ApiKeyListItem } from '@core/types/api-key-list-item.interface';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly apiKeySecret: string;

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('API_KEY_SECRET');
    if (!secret) {
      throw new Error(
        'API_KEY_SECRET environment variable is required but not set',
      );
    }
    this.apiKeySecret = secret;
  }

  private hashKey(plainKey: string): string {
    return crypto
      .createHmac('sha256', this.apiKeySecret)
      .update(plainKey)
      .digest('hex');
  }

  async create(
    description?: string,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = this.hashKey(plainKey);
    const apiKey = this.apiKeyRepository.create({ hashedKey, description });
    return { apiKey: await this.apiKeyRepository.save(apiKey), plainKey };
  }

  async findAll(): Promise<ApiKeyListItem[]> {
    const keys = await this.apiKeyRepository.find();
    return keys.map(({ id, description, isActive, createdAt, updatedAt }) => ({
      id,
      description,
      isActive,
      createdAt,
      updatedAt,
    }));
  }

  async revokeById(id: number): Promise<void> {
    await this.apiKeyRepository.update({ id }, { isActive: false });
  }

  async validate(key: string): Promise<boolean> {
    const hashedKey = this.hashKey(key);
    const apiKey = await this.apiKeyRepository.findOne({
      where: { hashedKey, isActive: true },
    });
    return !!apiKey;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
docker compose exec api npx jest --testPathPattern=api-key.service.spec
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/api-key.service.ts src/core/api-key.service.spec.ts
git commit -m "🔒 feat(api-keys): hash keys with HMAC-SHA256 on create and validate"
```

---

### Task 3: Update ApiKeyController

**Files:**
- Modify: `src/core/api-key.controller.ts`

- [ ] **Step 1: Update create() to use new return type**

Change the `create` method in the controller:

```typescript
  async create(
    @Body('description') description?: string,
  ): Promise<
    SuccessResponseDto<{ id: number; key: string; description?: string }>
  > {
    const { apiKey, plainKey } = await this.apiKeyService.create(description);
    return new SuccessResponseDto({
      id: apiKey.id,
      key: plainKey, // Plain key shown only once
      description: apiKey.description,
    });
  }
```

- [ ] **Step 2: Verify build compiles**

```bash
docker compose exec api npx nest build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/core/api-key.controller.ts
git commit -m "🔒 feat(api-keys): return plain key only once on creation"
```

---

## Chunk 2: Migration

### Task 4: Create migration to rename column and hash existing keys

**Files:**
- Create: `src/database/migrations/XXXX-hash-api-keys.ts`

- [ ] **Step 1: Generate migration timestamp**

Use current timestamp for the migration filename. Create the file:

```typescript
// src/database/migrations/1774000000000-hash-api-keys.ts
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class HashApiKeys1774000000000 implements MigrationInterface {
  name = 'HashApiKeys1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the secret from environment
    const secret = process.env.API_KEY_SECRET;
    if (!secret) {
      throw new Error(
        'API_KEY_SECRET environment variable is required to run this migration',
      );
    }

    // Hash all existing plain-text keys
    const existingKeys = await queryRunner.query(
      `SELECT id, \`key\` FROM api_keys`,
    );

    for (const row of existingKeys) {
      const hashedKey = crypto
        .createHmac('sha256', secret)
        .update(row.key)
        .digest('hex');
      await queryRunner.query(
        `UPDATE api_keys SET \`key\` = ? WHERE id = ?`,
        [hashedKey, row.id],
      );
    }

    // Rename column key -> hashedKey
    await queryRunner.query(
      `ALTER TABLE api_keys CHANGE \`key\` \`hashedKey\` varchar(255) NOT NULL`,
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'This migration is irreversible. Hashed API keys cannot be restored to plain text.',
    );
  }
}
```

- [ ] **Step 2: Run migration**

```bash
docker compose exec api npx ts-node -P ./tsconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./src/config/typeorm.config.ts
```

Expected: Migration runs successfully.

- [ ] **Step 3: Commit**

```bash
git add src/database/migrations/1774000000000-hash-api-keys.ts
git commit -m "🗃️ feat(database): add migration to hash existing API keys and rename column"
```

---

### Task 5: Run all tests and verify

- [ ] **Step 1: Run all project tests**

```bash
docker compose exec api npx jest --testPathPattern="api-key"
```

Expected: All api-key tests pass (service, guard, controller).

- [ ] **Step 2: Verify build**

```bash
docker compose exec api npx nest build
```

Expected: Build succeeds.

- [ ] **Step 3: Final commit with env example**

```bash
git add ".env .example"
git commit -m "🔒 chore: add API_KEY_SECRET to env example"
```
