# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

```bash
# Install dependencies
yarn install

# Development
yarn start:dev

# Build
yarn build

# Lint & format
yarn lint
yarn format        # Prettier write (src, test, eslint.config.js)
yarn format:check  # Prettier check sin escribir (útil antes de PR)

# Tests
yarn test              # Run unit tests
yarn test:watch        # Watch mode
yarn test:cov          # With coverage
yarn test:e2e          # E2E tests

# Database
yarn migration:generate src/database/migrations/Name
yarn migration:run
yarn migration:revert
yarn seed:test         # Seed database
```

## Architecture Overview

**NestJS 11** REST API with **TypeORM** and **MySQL**.

### Module Structure (src/)

```
src/
├── app.module.ts          # Root module - imports all feature modules
├── main.ts                # Entry point - CORS, Swagger, global pipes
├── auth/                  # JWT + local auth strategies
├── users/                 # User entity and management
├── projects/              # Project CRUD
├── contacts/              # Contact form submissions
├── health/                # Health checks
├── config/                # TypeORM + AppConfigurationModule (tipado)
├── database/              # Migrations, seeder
└── core/                  # Shared utilities
    ├── decorators/        # @ApiStandardResponses, @Public, @CurrentUser
    ├── dto/               # BaseResponseDto, PaginatedResponseDto
    ├── entities/          # Base entity, API key entity
    ├── exceptions/        # Custom exceptions + GlobalExceptionFilter
    ├── interceptors/      # ResponseTransformInterceptor (global)
    ├── middleware/        # RequestIdMiddleware (48-bit hex)
    ├── context/           # RequestContextService (nestjs-cls)
    ├── pipes/             # ValidationPipe
    ├── services/          # BaseCrudService
    ├── utils/             # PaginationUtil
    └── throttler/         # Rate limiting config
```

### Configuración tipada

`AppConfigurationModule` registra namespaces en `ConfigService`:

| Clave        | Tipo            | Uso                          |
|-------------|-----------------|------------------------------|
| `app`       | `AppConfig`     | `nodeEnv`, `port`, `corsOrigins` |
| `database`  | `DatabaseConfig`| MySQL / pool / SSL           |
| `redis`     | `RedisConfig`   | host, port, password, TTL    |
| `jwt`       | `JwtConfig`     | `secret`, `expiresInSeconds` |

```ts
const redis = this.configService.getOrThrow<RedisConfig>('redis');
```

Migraciones CLI usan `loadDatabaseConfig()` + `createTypeOrmOptions()` (misma fuente que la app).

### Path Aliases (tsconfig.json)

- `@core/*` → src/core/*
- `@auth/*` → src/auth/*
- `@users/*` → src/users/*
- `@projects/*` → src/projects/*
- `@contacts/*` → src/contacts/*
- `@config/*` → src/config/*
- `@database/*` → src/database/*
- `@health/*` → src/health/*

### Key Patterns

**Response Format**: All responses wrapped by `ResponseTransformInterceptor`:
```json
{
  "status": "success",
  "request_id": "req_88229911aabb",
  "data": { ... },
  "meta": { "pagination": { ... } } // if paginated
}
```

**Error Handling**: `GlobalExceptionFilter` catches all errors, formats consistently with request_id, code, message, path, timestamp.

**Request Context**: `RequestContextService` provides type-safe access to request-scoped data (request ID, etc.) via `nestjs-cls`/AsyncLocalStorage.

**Swagger**: Standardized decorators (`@ApiGetSingleResource`, `@ApiGetPaginatedList`, `@ApiCreateResource`, etc.) auto-document standard responses. Available at `/docs`.

**Rate Limiting**: `AppThrottlerModule` with different limits for auth (strict), public, and protected endpoints.

**Typed config**: `ConfigService.getOrThrow<RedisConfig>('redis')` — namespaces `app`, `database`, `redis`, `jwt`. Ver `src/config/configuration.types.ts`.

### Feature Modules

Each feature module follows the pattern:
- `controller.ts` - HTTP endpoints with Swagger decorators
- `service.ts` - Business logic, extends `BaseCrudService` where applicable
- `entity.ts` - TypeORM entity extending base entity
- `dto/` - Create/Update/Response DTOs with class-validator
- `*.spec.ts` - Unit tests

### Testing

- Jest with `ts-jest` and path alias mapping
- Unit tests: `*.spec.ts` alongside source files
- E2E tests: `test/app.e2e-spec.ts`
- Coverage excludes: modules, migrations, seeders, config files

## Environment Variables

Required: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`

Optional: `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `THROTTLE_TTL`, `THROTTLE_LIMIT`, `THROTTLE_PUBLIC_LIMIT`, `THROTTLE_STRICT_LIMIT`

## Documentation

- `docs/api/endpoints.md` - Detailed endpoint documentation
- `docs/standardization/api-standards.md` - Response format, decorators, context implementation
- `docs/planning/roadmap.md` - Project roadmap and task status
- `docs/RELEASE_WORKFLOW.md` - Release process with GitFlow
