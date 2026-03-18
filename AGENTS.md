# AGENTS.md

> **This file contains all guidelines, conventions, and workflows for this project.**

---

## Git & Commits

### Gitmoji + Conventional Commits

Use [Gitmoji](https://gitmoji.dev/) emojis in commit messages and PR titles.

**IMPORTANT:** Before using a gitmoji in PR titles or commits, query the API to get the correct emoji and code:

```bash
# Fetch latest gitmojis from API (JSON format)
curl -s https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json

# Or use the gitmojis npm package
npm install gitmojis
import { gitmojis } from 'gitmojis';
```

**API Response Structure:**
```json
{
  "$schema": "...",
  "gitmojis": [
    {
      "emoji": "✨",
      "entity": "&#x2728;",
      "code": ":sparkles:",
      "description": "Introduce new features",
      "name": "sparkles",
      "semver": "minor"
    }
  ]
}
```

**Common Gitmojis:**

| Emoji | Code | Type | Description |
|-------|------|------|-------------|
| ✨ | `:sparkles:` | `feat` | New feature |
| 🐛 | `:bug:` | `fix` | Bug fix |
| 📝 | `:memo:` | `docs` | Documentation |
| ♻️ | `:recycle:` | `refactor` | Refactoring |
| ✅ | `:white_check_mark:` | `test` | Tests |
| ⚙️ | `:gear:` | `chore` | Configuration |
| 🔒️ | `:lock:` | Security | Security fixes |
| 🚀 | `:rocket:` | Deploy | Deployment/release |
| 🔥 | `:fire:` | Remove | Removing code |
| 🎨 | `:art:` | Style | Code style/format |

**Format:**
```
<emoji> <type>(<scope>): <description>
```

**Examples:**
```
✨ feat(auth): add refresh token endpoint
🐛 fix(users): resolve pagination edge case
📝 docs: update API documentation
♻️ refactor(core): simplify validation logic
✅ test(auth): add unit tests for JWT strategy
⚙️ chore(deps): update dependencies
🔒️ fix(auth): patch security vulnerability
🚀 release: v0.1.0
```

### Branch Naming

```
<type>/<short-description>
```

Examples:
- `feature/user-authentication`
- `fix/login-bug`
- `docs/api-endpoints`
- `refactor/database-module`
- `release/0.1.0`
- `hotfix/0.1.1`

### Commit Guidelines

- One concern per commit
- Write in imperative mood: "add feature" not "added feature"
- Focus on WHY, not WHAT (the diff shows the what)
- Keep commits atomic and reversible

---

## GitFlow Workflow

```
main (production-ready)
  ↑
develop (integration branch)
  ↑
feature/* ────┘
```

### Feature Flow

```bash
# Create feature
git checkout develop && git pull
git checkout -b feature/name

# Work, commit, push (use gitmoji + conventional commit)
git add . && git commit -m "✨ feat: description"
git push origin feature/name

# Create PR (include gitmoji in title)
gh pr create --base develop --head feature/name --title "✨ feat: title" --body "..."

# After merge
git checkout develop && git pull && git branch -d feature/name
```

### Release Flow

```bash
# Create release branch
git checkout develop && git pull
git checkout -b release/0.1.0

# Prepare: update CHANGELOG.md, version, test
git add . && git commit -m "⚙️ chore: prepare release 0.1.0"
git push origin release/0.1.0

# Create PR to main
gh pr create --base main --head release/0.1.0 --title "🚀 Release 0.1.0"

# Al mergear → auto-release workflow crea el GitHub Release → deploy automático

# Post-release: merge back to develop
git checkout develop && git merge main --no-ff && git push
```

### Hotfix Flow

```bash
# Create hotfix from main
git checkout main && git pull
git checkout -b hotfix/0.1.1

# Apply fix + update CHANGELOG.md
git add . && git commit -m "🐛 fix: description"
git push origin hotfix/0.1.1

# Create PR to main
gh pr create --base main --head hotfix/0.1.1 --title "🔥 Hotfix 0.1.1"

# Al mergear → auto-release → deploy automático
```

---

## Release Workflow

For detailed release workflow documentation, see [./docs/RELEASE_WORKFLOW.md](./docs/RELEASE_WORKFLOW.md).

### Quick Summary

| Step | Action |
|------|--------|
| 1 | Create `release/X.Y.Z` branch from `develop` |
| 2 | Update `CHANGELOG.md` with release notes |
| 3 | Create PR to `main` |
| 4 | Merge PR → **Auto-release workflow** creates GitHub Release |
| 5 | **Deploy workflow** detects release → deploys to production |
| 6 | Merge `main` back to `develop` |

---

## Project Conventions

### Code Style

- TypeScript strict mode
- ESLint + Prettier (auto-format on save)
- Absolute imports via path aliases (`@core/`, `@auth/`, etc.)

### Testing

- TDD workflow: Red → Green → Refactor
- Test naming: `should_<expected_behavior>`
- Unit tests alongside source: `*.spec.ts`
- Coverage threshold: 90%

### Security

- No secrets in code (use environment variables)
- API keys stored hashed (HMAC-SHA256)
- Input validation at system boundaries
- Parameterized queries only

---

## Architecture Quick Reference

```
src/
├── app.module.ts          # Root module
├── main.ts                # Entry point
├── auth/                  # JWT + local auth
├── users/                 # User management
├── projects/              # Project CRUD
├── contacts/              # Contact form
├── health/                # Health checks
├── config/                # Typed configuration
├── database/              # Migrations + seeder
└── core/                  # Shared utilities
```

### Path Aliases

- `@core/*` → src/core/*
- `@auth/*` → src/auth/*
- `@users/*` → src/users/*
- `@projects/*` → src/projects/*
- `@contacts/*` → src/contacts/*
- `@config/*` → src/config/*
- `@database/*` → src/database/*
- `@health/*` → src/health/*

### Key Patterns

| Pattern | Implementation |
|---------|----------------|
| Response format | `ResponseTransformInterceptor` |
| Error handling | `GlobalExceptionFilter` with request_id |
| Request context | `RequestContextService` (nestjs-cls) |
| Rate limiting | `AppThrottlerModule` (tiered limits) |

---

## Development Quick Reference

```bash
# Install
yarn install

# Development
yarn start:dev

# Build
yarn build

# Lint & format
yarn lint
yarn format

# Tests
yarn test
yarn test:watch
yarn test:cov

# Database
yarn migration:generate src/database/migrations/Name
yarn migration:run
yarn migration:revert
```

---

## Documentation

- [./CLAUDE.md](./CLAUDE.md) - Quick reference (minimal)
- [./docs/RELEASE_WORKFLOW.md](./docs/RELEASE_WORKFLOW.md) - Detailed release process
- [./docs/CODE_REVIEW.md](./docs/CODE_REVIEW.md) - Code review findings
- [./docs/api/endpoints.md](./docs/api/endpoints.md) - API documentation
