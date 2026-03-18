# Redis Caching for Projects Endpoints

**Date**: 2026-03-17
**Issue**: #49 - Implement Redis caching for GET /projects
**Branch**: feature/improve-database-config

## Goal

Cache `GET /projects` and `GET /projects/:id` responses in Redis to reduce MySQL load. Invalidate only project-related cache keys on create, update, or delete operations.

## Approach

NestJS `@CacheInterceptor` (Enfoque A) with a custom extension that prefixes cache keys with `projects:` for targeted invalidation.

## Architecture

```
Request → AuthGuard → ProjectsCacheInterceptor → Controller → Service → MySQL
                              ↓ (cache hit)
                          Redis store
                              ↑ (invalidation on write)
                     Service.create/update/remove()
```

## Assumptions

- All authenticated users see the same project data. There is no per-user filtering. Cache keys are URL-based only, shared across all requests.
- If this changes in the future (per-user project visibility), the cache key strategy must be extended to include user context.

## Components

### 1. Infrastructure: Redis in compose.yml

Add `redis` service to existing `compose.yml` on the `portfolio` network. Exposed on port 6379. Add `depends_on` with health check so the API waits for Redis to be ready.

### 2. RedisCacheModule (global)

- Path: `src/cache/redis-cache.module.ts`
- Uses `@nestjs/cache-manager` with `cache-manager-redis-yet` store
- Registered globally in `app.module.ts`
- Config via env vars: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TTL`
- **Important**: `cache-manager` v5 uses milliseconds for TTL. The module must convert `REDIS_TTL` (seconds) to ms: `ttl: REDIS_TTL * 1000`

### 3. ProjectsCacheInterceptor

- Path: `src/projects/interceptors/projects-cache.interceptor.ts`
- Extends NestJS `CacheInterceptor`
- Overrides `trackBy()` to prefix keys with `projects:` (e.g., `projects:/projects?page=1&per_page=10`)
- Only caches GET requests (default behavior)

### 4. Cache invalidation helper

- Path: `src/cache/cache-invalidation.service.ts`
- Injects the raw Redis client from `CACHE_MANAGER` via `(cacheManager.store as RedisStore).client`
- Method `invalidateByPrefix(prefix: string)`: uses Redis `SCAN` + `DEL` to remove keys matching `prefix:*`
- SCAN-based approach avoids blocking Redis (unlike `KEYS` command)
- **Note**: There is a small race condition window between SCAN and DEL where a new key could be written and missed. This is acceptable for a low-write portfolio API.

### 5. ProjectsService changes

- Inject `CacheInvalidationService`
- Call `invalidateByPrefix('projects')` in `create()`, `update()`, and `remove()`
- **Error handling**: Cache invalidation must be wrapped in its own try/catch. If Redis is down, log the error and continue. A failed invalidation must NOT cause the DB write to appear as failed to the client.

### 6. ProjectsController changes

- Add `@UseInterceptors(ProjectsCacheInterceptor)` on `findAll()` and `findOne()`

## Files to create/modify

| File | Action | Description |
|------|--------|-------------|
| `compose.yml` | Modify | Add redis service with health check |
| `src/cache/redis-cache.module.ts` | Create | Global cache module with Redis store |
| `src/cache/cache-invalidation.service.ts` | Create | SCAN+DEL invalidation by prefix |
| `src/projects/interceptors/projects-cache.interceptor.ts` | Create | Custom interceptor with `projects:` prefix |
| `src/projects/projects.controller.ts` | Modify | Add cache interceptor to GET endpoints |
| `src/projects/projects.service.ts` | Modify | Invalidate cache on write operations |
| `src/projects/projects.module.ts` | Modify | Import CacheInvalidationService |
| `src/app.module.ts` | Modify | Import RedisCacheModule |
| `.env .example` | Modify | Add REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TTL |
| `src/projects/projects.service.spec.ts` | Modify | Mock CacheInvalidationService in tests |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | _(empty)_ | Redis password (optional for dev, required for prod) |
| `REDIS_TTL` | `300` | Cache TTL in seconds (5 minutes). Converted to ms internally. |

## Cache Key Format

- List: `projects:/projects?page=1&per_page=10&search=foo`
- Single: `projects:/projects/5`

## Invalidation Strategy

- On `create()`, `update()`, `remove()`: run `SCAN 0 MATCH projects:* COUNT 100` + `DEL` matched keys
- SCAN is non-blocking and safe for production
- Only project keys are affected; other modules' cache remains intact
- Invalidation errors are logged but do not propagate to the caller

## Coexistence with TypeORM cache

The existing TypeORM query cache (`DB_CACHE_ENABLED` in `typeorm-common.config.ts`) operates at the DB query level and is independent. Both caching layers can coexist without conflict.

## Dependencies to install

- `@nestjs/cache-manager`
- `cache-manager`
- `cache-manager-redis-yet`
