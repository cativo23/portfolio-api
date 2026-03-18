# Redis Caching for Projects Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache GET /projects and GET /projects/:id in Redis with prefix-based invalidation on writes.

**Architecture:** NestJS CacheInterceptor extended with configurable prefix for cache keys. A CacheInvalidationService uses Redis SCAN+DEL to clear keys by prefix. Redis runs alongside MySQL in docker-compose.

**Tech Stack:** @nestjs/cache-manager, cache-manager, cache-manager-redis-yet, Redis 7

**Spec:** `docs/superpowers/specs/2026-03-17-redis-caching-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `compose.yml` | Add Redis service with health check |
| `src/cache/redis-cache.module.ts` | Global CacheModule config with Redis store |
| `src/cache/cache-invalidation.service.ts` | SCAN+DEL invalidation by prefix |
| `src/cache/cache-invalidation.service.spec.ts` | Tests for invalidation service |
| `src/projects/interceptors/projects-cache.interceptor.ts` | CacheInterceptor with `projects:` prefix |
| `src/projects/projects.controller.ts` | Add interceptor to GET endpoints |
| `src/projects/projects.service.ts` | Inject invalidation, call on writes |
| `src/projects/projects.module.ts` | Import CacheInvalidationService |
| `src/app.module.ts` | Import RedisCacheModule |
| `.env .example` | Add REDIS_* env vars |
| `src/projects/projects.service.spec.ts` | Mock CacheInvalidationService |

---

## Chunk 1: Infrastructure and Cache Module

### Task 1: Add Redis to docker-compose and env vars

**Files:**
- Modify: `compose.yml`
- Modify: `.env .example`

- [ ] **Step 1: Add Redis service to compose.yml**

Add after the `mysql` service block:

```yaml
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - 'redis-data:/data'
    networks:
      - portfolio
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 3
```

Add `depends_on` to the `api` service:

```yaml
    depends_on:
      redis:
        condition: service_healthy
```

Add `redis-data` to the volumes section:

```yaml
  redis-data:
    driver: local
```

- [ ] **Step 2: Add Redis env vars to .env .example**

Append after the JWT section:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300
```

- [ ] **Step 3: Commit**

```bash
git add compose.yml ".env .example"
git commit -m "🔧 chore: add Redis service to docker-compose and env vars"
```

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install cache packages**

```bash
yarn add @nestjs/cache-manager cache-manager cache-manager-redis-yet
```

- [ ] **Step 2: Commit**

```bash
git add package.json yarn.lock
git commit -m "📦 chore: add cache-manager and Redis dependencies"
```

---

### Task 3: Create RedisCacheModule

**Files:**
- Create: `src/cache/redis-cache.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create the module**

```typescript
// src/cache/redis-cache.module.ts
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: configService.get<number>('REDIS_PORT') || 6379,
          },
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        });
        return {
          store,
          ttl: (configService.get<number>('REDIS_TTL') || 300) * 1000,
        };
      },
    }),
  ],
})
export class RedisCacheModule {}
```

**Note:** In Task 4 (after creating `CacheInvalidationService`), we will come back to this file to add `providers: [CacheInvalidationService]`, `exports: [CacheInvalidationService]`, and the `@Global()` decorator. This avoids a circular dependency during implementation.

- [ ] **Step 2: Register in AppModule**

In `src/app.module.ts`, add import:

```typescript
import { RedisCacheModule } from '@src/cache/redis-cache.module';
```

Add `RedisCacheModule` to the imports array after `ConfigModule.forRoot()`:

```typescript
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  RedisCacheModule,
  HealthModule,
  // ...rest
],
```

- [ ] **Step 3: Verify the app compiles**

```bash
yarn build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/cache/redis-cache.module.ts src/app.module.ts
git commit -m "✨ feat(cache): add global RedisCacheModule with configurable Redis store"
```

---

## Chunk 2: Cache Invalidation Service

### Task 4: Create CacheInvalidationService with tests (TDD)

**Files:**
- Create: `src/cache/cache-invalidation.service.ts`
- Create: `src/cache/cache-invalidation.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/cache/cache-invalidation.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheInvalidationService } from './cache-invalidation.service';
import { Logger } from '@nestjs/common';

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;
  let mockRedisClient: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockRedisClient = {
      scanIterator: jest.fn(),
      del: jest.fn(),
    };

    mockCacheManager = {
      store: {
        client: mockRedisClient,
      },
    };

    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInvalidationService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CacheInvalidationService>(CacheInvalidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidateByPrefix', () => {
    it('should delete all keys matching the prefix', async () => {
      const keys = ['projects:/projects?page=1', 'projects:/projects/5'];
      mockRedisClient.scanIterator.mockReturnValue(
        (async function* () {
          for (const key of keys) yield key;
        })(),
      );
      mockRedisClient.del.mockResolvedValue(2);

      await service.invalidateByPrefix('projects');

      expect(mockRedisClient.scanIterator).toHaveBeenCalledWith({
        MATCH: 'projects:*',
        COUNT: 100,
      });
      expect(mockRedisClient.del).toHaveBeenCalledWith(keys);
    });

    it('should not call del when no keys match', async () => {
      mockRedisClient.scanIterator.mockReturnValue(
        (async function* () {})(),
      );

      await service.invalidateByPrefix('projects');

      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should log error and not throw when scanIterator fails', async () => {
      mockRedisClient.scanIterator.mockImplementation(() => {
        throw new Error('Redis connection refused');
      });

      await expect(
        service.invalidateByPrefix('projects'),
      ).resolves.not.toThrow();
    });

    it('should log error and not throw when del fails', async () => {
      const keys = ['projects:/projects?page=1'];
      mockRedisClient.scanIterator.mockReturnValue(
        (async function* () {
          for (const key of keys) yield key;
        })(),
      );
      mockRedisClient.del.mockRejectedValue(new Error('DEL failed'));

      await expect(
        service.invalidateByPrefix('projects'),
      ).resolves.not.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test -- --testPathPattern=cache-invalidation
```

Expected: FAIL - CacheInvalidationService not found.

- [ ] **Step 3: Write the implementation**

```typescript
// src/cache/cache-invalidation.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      const client = (this.cacheManager.store as any).client;
      const keys: string[] = [];

      for await (const key of client.scanIterator({
        MATCH: `${prefix}:*`,
        COUNT: 100,
      })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await client.del(keys);
        this.logger.log(
          `Invalidated ${keys.length} cache keys with prefix "${prefix}"`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache with prefix "${prefix}": ${error.message}`,
      );
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
yarn test -- --testPathPattern=cache-invalidation
```

Expected: PASS - all 4 tests pass.

- [ ] **Step 5: Register CacheInvalidationService in RedisCacheModule**

Update `src/cache/redis-cache.module.ts` to add the `@Global()` decorator, import, provider, and export:

```typescript
import { Global, Module } from '@nestjs/common';
// ...existing imports...
import { CacheInvalidationService } from './cache-invalidation.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      // ...existing config unchanged...
    }),
  ],
  providers: [CacheInvalidationService],
  exports: [CacheInvalidationService],
})
export class RedisCacheModule {}
```

- [ ] **Step 6: Commit**

```bash
git add src/cache/cache-invalidation.service.ts src/cache/cache-invalidation.service.spec.ts src/cache/redis-cache.module.ts
git commit -m "✨ feat(cache): add CacheInvalidationService with prefix-based SCAN+DEL"
```

---

## Chunk 3: Projects Cache Interceptor

### Task 5: Create ProjectsCacheInterceptor with tests (TDD)

**Files:**
- Create: `src/projects/interceptors/projects-cache.interceptor.ts`
- Create: `src/projects/interceptors/projects-cache.interceptor.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/projects/interceptors/projects-cache.interceptor.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { ProjectsCacheInterceptor } from './projects-cache.interceptor';

describe('ProjectsCacheInterceptor', () => {
  let interceptor: ProjectsCacheInterceptor;

  beforeEach(() => {
    interceptor = new (ProjectsCacheInterceptor as any)(null, null);
  });

  const createMockContext = (method: string, url: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
      }),
    }) as any;

  it('should return prefixed key for GET requests', () => {
    const context = createMockContext('GET', '/projects?page=1&per_page=10');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:/projects?page=1&per_page=10');
  });

  it('should return prefixed key for GET by id', () => {
    const context = createMockContext('GET', '/projects/5');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBe('projects:/projects/5');
  });

  it('should return undefined for non-GET requests', () => {
    const context = createMockContext('POST', '/projects');
    const result = (interceptor as any).trackBy(context);
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test -- --testPathPattern=projects-cache.interceptor
```

Expected: FAIL - ProjectsCacheInterceptor not found.

- [ ] **Step 3: Create the interceptor**

```typescript
// src/projects/interceptors/projects-cache.interceptor.ts
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return undefined;
    }

    return `projects:${request.url}`;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
yarn test -- --testPathPattern=projects-cache.interceptor
```

Expected: PASS - all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/projects/interceptors/projects-cache.interceptor.ts src/projects/interceptors/projects-cache.interceptor.spec.ts
git commit -m "✨ feat(projects): add ProjectsCacheInterceptor with prefix key generation"
```

---

## Chunk 4: Wire Cache into Projects Module

### Task 6: Add cache interceptor to ProjectsController

**Files:**
- Modify: `src/projects/projects.controller.ts`

- [ ] **Step 1: Add UseInterceptors import and ProjectsCacheInterceptor**

Add to imports at top of file:

```typescript
import { UseInterceptors } from '@nestjs/common';
import { ProjectsCacheInterceptor } from './interceptors/projects-cache.interceptor';
```

Note: `UseInterceptors` goes into the existing `@nestjs/common` import block.

- [ ] **Step 2: Add @UseInterceptors(ProjectsCacheInterceptor) to findAll()**

Add the decorator before the `async findAll(` method, after the `@ApiResponse` decorators:

```typescript
  @UseInterceptors(ProjectsCacheInterceptor)
  async findAll(
```

- [ ] **Step 3: Add @UseInterceptors(ProjectsCacheInterceptor) to findOne()**

Same pattern, before `async findOne(`:

```typescript
  @UseInterceptors(ProjectsCacheInterceptor)
  async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
```

- [ ] **Step 4: Commit**

```bash
git add src/projects/projects.controller.ts
git commit -m "✨ feat(projects): add cache interceptor to GET endpoints"
```

---

### Task 7: Add cache invalidation to ProjectsService

**Files:**
- Modify: `src/projects/projects.service.ts`

- [ ] **Step 1: Verify ProjectsModule does NOT need changes**

`CacheInvalidationService` is globally available via `@Global()` on `RedisCacheModule`. No changes needed to `src/projects/projects.module.ts` — just inject it in the service.

- [ ] **Step 2: Inject CacheInvalidationService in ProjectsService**

Add import at top of `src/projects/projects.service.ts`:

```typescript
import { CacheInvalidationService } from '@src/cache/cache-invalidation.service';
```

Modify constructor:

```typescript
constructor(
  @InjectRepository(Project)
  private projectsRepository: Repository<Project>,
  private readonly cacheInvalidationService: CacheInvalidationService,
) {}
```

- [ ] **Step 3: Add invalidation to create() method**

After the `this.logger.log(...)` line inside create(), add the invalidation call. **Note:** `invalidateByPrefix` has its own internal try/catch — it never throws. This is safe inside the existing try/catch block because a Redis failure will be logged but won't propagate.

```typescript
      // Safe to call here: invalidateByPrefix never throws (has internal try/catch)
      await this.cacheInvalidationService.invalidateByPrefix('projects');
```

The full create method becomes:

```typescript
  async create(
    createProjectDto: CreateProjectDto,
  ): Promise<SingleProjectResponseDto> {
    try {
      const project = this.projectsRepository.create(createProjectDto);
      const savedProject = await this.projectsRepository.save(project);
      this.logger.log(`Project created with ID ${savedProject.id}`);
      // Safe: invalidateByPrefix never throws (has internal try/catch)
      await this.cacheInvalidationService.invalidateByPrefix('projects');
      return SingleProjectResponseDto.fromEntity(savedProject);
    } catch (error) {
      this.logger.error('Error creating project', error.stack);
      throw new InternalServerException('Error creating project');
    }
  }
```

- [ ] **Step 4: Add invalidation to update() method**

After `this.logger.log(\`Updated project with ID ${id}\`)`, add:

```typescript
      await this.cacheInvalidationService.invalidateByPrefix('projects');
```

- [ ] **Step 5: Add invalidation to remove() method**

After `this.logger.log(\`Deleted project with ID ${id}\`)`, add:

```typescript
      await this.cacheInvalidationService.invalidateByPrefix('projects');
```

- [ ] **Step 6: Verify build compiles**

```bash
yarn build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/projects/projects.service.ts
git commit -m "✨ feat(projects): invalidate cache on create, update, and delete operations"
```

---

## Chunk 5: Update Tests

### Task 8: Update ProjectsService tests to mock CacheInvalidationService

**Files:**
- Modify: `src/projects/projects.service.spec.ts`

- [ ] **Step 1: Add mock for CacheInvalidationService**

Add import at top:

```typescript
import { CacheInvalidationService } from '@src/cache/cache-invalidation.service';
```

Add mock variable after the Logger spy variables:

```typescript
  let cacheInvalidationService: CacheInvalidationService;
```

In the `beforeEach`, add to the providers array:

```typescript
        {
          provide: CacheInvalidationService,
          useValue: {
            invalidateByPrefix: jest.fn().mockResolvedValue(undefined),
          },
        },
```

After `module.get` calls, add:

```typescript
    cacheInvalidationService = module.get<CacheInvalidationService>(CacheInvalidationService);
```

- [ ] **Step 2: Add test for cache invalidation on create**

Inside the `describe('create')` block, add:

```typescript
    it('should invalidate cache after creating a project', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
      };
      const project = { id: 1, ...createProjectDto };

      jest.spyOn(repository, 'create').mockReturnValue(project as any);
      jest.spyOn(repository, 'save').mockResolvedValue(project as any);

      await service.create(createProjectDto);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith('projects');
    });
```

- [ ] **Step 3: Add test for cache invalidation on update**

Inside the `describe('update')` block, add:

```typescript
    it('should invalidate cache after updating a project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated Description',
      };
      const existingProject = { id: 1, title: 'Original', description: 'Original' };
      const updatedProject = { id: 1, ...updateProjectDto };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(existingProject as any)
        .mockResolvedValueOnce(updatedProject as any);
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      await service.update(1, updateProjectDto);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith('projects');
    });
```

- [ ] **Step 4: Add test for cache invalidation on remove**

Inside the `describe('remove')` block, add:

```typescript
    it('should invalidate cache after removing a project', async () => {
      const existingProject = { id: 1, title: 'Test', description: 'Test' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith('projects');
    });
```

- [ ] **Step 5: Run all tests**

```bash
yarn test
```

Expected: All tests pass, including new cache invalidation tests.

- [ ] **Step 6: Commit**

```bash
git add src/projects/projects.service.spec.ts
git commit -m "✅ test(projects): add cache invalidation tests to ProjectsService"
```
