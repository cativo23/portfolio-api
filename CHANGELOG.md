# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-03-18

### Added
- **Redis caching**: `GET /projects` and `GET /projects/:id` cached in Redis with prefix-based invalidation on writes (#49)
- **Cache invalidation service**: `CacheInvalidationService` with SCAN+DEL by prefix, never throws
- **ProjectsCacheInterceptor**: Extends NestJS `CacheInterceptor` with configurable `projects:` key prefix
- **RedisCacheModule**: Global cache module with `cache-manager-redis-yet` store, TTL configurable via `REDIS_TTL`
- **Redis in Docker Compose**: Redis 7 with health check and `depends_on` for API service
- **Database connection pooling**: Configurable pool size, connection limit, and timeouts
- **Database connection retry**: `ConnectionRetryService` with configurable max retries and delay
- **Database SSL support**: Full SSL configuration for secure database connections
- **Database transactions**: `TransactionService` with `executeInTransaction()` and `executeWithQueryRunner()`
- **Database seeding**: Base seeder framework with user and project seeders (`db:seed` script)
- **Custom TypeORM logger**: `TypeOrmLoggerService` with slow query detection and configurable log levels
- **TypeORM query caching**: Database-backed caching with configurable duration
- **API key hashing**: HMAC-SHA256 with global secret, plain key shown only once at creation (#40)
- **Startup validation**: App fails to start if `API_KEY_SECRET` is missing
- **Validated configuration**: `AppConfigurationModule` with typed namespaces (`app`, `database`, `redis`, `jwt`) (#51)
- **Environment utilities**: `env.utils.ts` for parsing Docker/Compose quoted values
- **CLAUDE.md**: AI/onboarding guide with architecture, commands, and patterns
- **AGENTS.md**: Git conventions, commit format, release workflow, PR process
- **CHANGELOG.md**: Keep a Changelog format replacing RELEASE_NOTES.md
- **Auto-release workflow**: GitHub Action creates releases from `release/*` branch merges to `main`
- **`format:check` script**: Prettier check without writing, useful for CI

### Changed
- **Config consolidation**: Shared `createTypeOrmOptions()` receives typed `DatabaseConfig` instead of `ConfigService`
- **TypeORM config**: CLI migrations and app use same config source via `loadDatabaseConfig()`
- **Auth refactor**: JWT guard, strategy, and service consume validated `JwtConfig` namespace
- **ESLint/Prettier separation**: Removed `eslint-plugin-prettier`, using `eslint-config-prettier` only
- **Health check**: Enhanced response with TypeORM health indicator, updated disk threshold to 80%
- **CODE_REVIEW.md**: Consolidated from two review docs into one with updated scores
- **Docker Compose**: Dynamic port mapping, Redis env vars with defaults

### Fixed
- Removed duplicate initial schema migration that broke `migration:run` on existing databases
- Removed `console.log` debug statement from global exception filter
- Fixed `TypeOrmLoggerService` injection with `extraProviders` in `TypeOrmModule.forRootAsync`
- Fixed typo "loadd" → "loaded" in `DatabaseModule`
- Fixed health controller test to match new response shape
- Fixed lint errors: unused `queryRunner` params and `error` variables
- Fixed `isHealthCheck` guard incorrectly limiting error details to health endpoints only
- Removed dead code: `revoke(key: string)` method in `ApiKeyService`

### Security
- API keys now stored hashed with HMAC-SHA256 instead of plaintext (#40)
- `API_KEY_SECRET` required at startup, app refuses to start without it
- Migration hashes existing plain-text keys in-place (irreversible)

### Removed
- `RELEASE_NOTES.md` (replaced by `CHANGELOG.md`)
- `docs/tasks.md` (replaced by GitHub issues)
- `eslint-plugin-prettier` dependency
- Old incremental migrations (consolidated into initial schema)

---

## [0.1.0] - 2026-03-18

### Added
- Initial release
- NestJS 11 REST API with TypeORM and MySQL
- JWT + local authentication strategies
- API key management
- Rate limiting with @nestjs/throttler
- Comprehensive test suite (90%+ coverage)
- Automated CI/CD with GitHub Actions
- Auto-release workflow for release branches

[Unreleased]: https://github.com/cativo23/portfolio-api/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/cativo23/portfolio-api/compare/v0.1.0...v1.1.0
[0.1.0]: https://github.com/cativo23/portfolio-api/releases/tag/v0.1.0
