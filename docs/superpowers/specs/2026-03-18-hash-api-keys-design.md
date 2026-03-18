# Hash API Keys Before Storage

**Date**: 2026-03-18
**Issue**: #40 - [SECURITY] Hash API Keys before storing in database
**Branch**: feature/hash-api-keys

## Goal

Hash API keys with HMAC-SHA256 using a global secret before storing in the database. Plain keys are returned only once at creation time.

## Approach

HMAC-SHA256 with a global secret from `API_KEY_SECRET` env var. This allows single-query validation (`WHERE hashedKey = ?`) since all keys share the same secret.

## Flow

### Creation
1. Generate plain key: `crypto.randomBytes(32).toString('hex')`
2. Hash: `crypto.createHmac('sha256', API_KEY_SECRET).update(plainKey).digest('hex')`
3. Store `hashedKey` in DB
4. Return `{ apiKey: entity, plainKey: string }` — the service returns both, the controller exposes the plain key **once**

### Validation
1. Receive plain key from request header/query
2. Hash with same secret
3. Query: `WHERE hashedKey = ? AND isActive = true`
4. Return boolean

## Entity Changes

`api_keys` table:
- Rename column `key` → `hashedKey`
- Keep unique index on `hashedKey`

## Service Changes

- `create()` returns `{ apiKey: ApiKey; plainKey: string }` instead of just `ApiKey`
- `validate(key)` hashes the input before querying
- `revoke(key: string)` method removed — only `revokeById(id)` remains (the controller already uses `revokeById`, `revoke(key)` is dead code and would break after column rename)
- Constructor validates `API_KEY_SECRET` is present, throws on startup if missing

## Controller Changes

- `create()` destructures `{ apiKey, plainKey }` from service, returns `plainKey` to the admin

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY_SECRET` | Yes | Global secret for HMAC-SHA256 hashing. App fails to start if missing. |

## Startup Validation

`ApiKeyService` constructor must validate that `API_KEY_SECRET` is set and non-empty. If missing, throw an error immediately so the app fails fast with a clear message instead of silently producing broken hashes.

## Migration

1. Rename column `key` → `hashedKey`
2. Load all existing keys, hash each with the secret, update the row
3. `down()` throws an error — hashing is irreversible, cannot restore plain-text keys

Since MySQL lacks native HMAC, the migration uses TypeORM's QueryRunner to load rows, hash in JS, and update.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/core/entities/api-key.entity.ts` | Modify | Rename `key` → `hashedKey` |
| `src/core/api-key.service.ts` | Modify | Hash on create/validate, remove `revoke(key)`, startup validation |
| `src/core/api-key.controller.ts` | Modify | Destructure `{ apiKey, plainKey }`, return plainKey on create |
| `.env .example` | Modify | Add `API_KEY_SECRET` |
| `src/database/migrations/XXXX-hash-api-keys.ts` | Create | Rename column + hash existing keys, irreversible down() |
| `src/core/api-key.service.spec.ts` | Modify | Update mocks for new create return type and hashing |
| `src/core/api-key.guard.spec.ts` | Modify | Update if needed |

## Security Notes

- If `API_KEY_SECRET` is compromised along with the DB, keys can be brute-forced. However, at that point the attacker already has DB access.
- The secret must not be committed to source control.
- Rotating the secret requires re-hashing all keys (migration script).
- `ConfigModule` is already global in this project, so `ConfigService` is injectable without additional module imports.
