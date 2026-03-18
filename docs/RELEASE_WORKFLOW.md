# Release Workflow

> **For Git conventions, commit standards, and branch naming: see [./AGENTS.md](../AGENTS.md)**

This document describes the release workflow for Portfolio API following industry standards based on GitFlow with automated releases.

---

## Automated Release

When a PR from a `release/*` branch is merged to `main`, the **Auto Release workflow** automatically:

1. Extracts version from branch name (`release/v0.1.0` → `v0.1.0`)
2. Validates semver format
3. Parses release notes from `CHANGELOG.md`
4. Creates GitHub Release (marked as prerelease if `v0.x.y`)

**No manual release creation needed** — just merge the release PR and the workflow handles the rest.

---

## Overview

The workflow follows the **GitFlow** pattern with the following branches:

- `main`: Production-ready code (stable and validated code only)
- `develop`: Development branch (feature integration)
- `feature/*`: New feature branches (created from `develop`)
- `hotfix/*`: Critical production fix branches (created from `main`)
- `release/*`: Release preparation branches (created from `develop`)

## Development Flow

### 1. Feature Development

New features are developed in `feature/*` branches created from `develop`:

```bash
# Ensure you're on an up-to-date develop
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/feature-name

# Make your changes and commits
git add .
git commit -m "feat: feature description"

# Push the branch
git push origin feature/feature-name
```

**Naming convention**: `feature/descriptive-name-kebab-case`

### 2. Merge to Develop

Once the feature is complete and tested locally:

#### 2.1 Create Pull Request

Using GitHub CLI:

```bash
gh pr create \
  --base develop \
  --head feature/feature-name \
  --title "feat: descriptive feature title" \
  --body "## Description

Detailed description of changes.

## Checklist

- [ ] Tests passing locally
- [ ] Lint checks passing
- [ ] Documentation updated (if applicable)

## Reviewers

Request review from team members."
```

Or use GitHub web UI:

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Base: `develop` ← Compare: `feature/feature-name`
4. Fill in title and description
5. Request review
6. Wait for approval

#### 2.2 Merge PR

Only after the PR is **approved by human reviewers**, the merge can proceed:

```bash
# Merge from GitHub UI or:
gh pr merge <PR_NUMBER> --merge

# After merge, update your local develop
git checkout develop
git pull origin develop

# Delete local feature branch (optional)
git branch -d feature/feature-name
```

## Release Flow

### 3. Release Preparation

When `develop` is ready for a new version, a `release/*` branch is created:

#### 3.1 Create Release Branch

```bash
# Ensure you're on an up-to-date develop
git checkout develop
git pull origin develop

# Create release branch with semantic versioning
git checkout -b release/0.1.0
git push origin release/0.1.0
```

**Naming convention**: `release/{major}.{minor}.{patch}` (el workflow agrega `v` automáticamente)

**Semantic Versioning**:

- **Major** (v1.x.x → v2.0.0): Incompatible changes, breaking changes
- **Minor** (v1.0.x → v1.1.0): New features, backward compatible
- **Patch** (v1.0.0 → v1.0.1): Bug fixes, backward compatible

#### 3.2 Prepare Release in Branch

On the `release/0.1.0` branch, perform the following tasks:

##### Update CHANGELOG.md

Add a new section for the release version:

```markdown
## [0.1.0] - 2026-03-18

### Added
- New feature description
- Another feature

### Changed
- Changed behavior description

### Fixed
- Bug fix description
```

> **Important**: The auto-release workflow parses release notes from `CHANGELOG.md`. Sin esta sección, el release usará un mensaje genérico.

##### Update Version (si aplica)

```bash
# Edit package.json to update version
# Example: "version": "0.1.0"
git add package.json
git commit -m "chore: bump version to 0.1.0"
```

##### Verify & Test

```bash
yarn lint
yarn test
yarn test:cov
```

#### 3.3 Create Pull Request to Main

```bash
gh pr create \
  --base main \
  --head release/0.1.0 \
  --title "🚀 Release 0.1.0" \
  --body "## Release 0.1.0

## Main Changes

- Change 1
- Change 2

## Checklist

- [x] Tests passing
- [x] Lint checks passing
- [x] CHANGELOG.md updated

## Reviewers

Please review and approve before merging to main."
```

> **Al mergear este PR**, el workflow `auto-release.yml` creará el GitHub Release automáticamente.

#### 3.4 Merge to Main

```bash
gh pr merge <PR_NUMBER> --merge

# Update local main
git checkout main
git pull origin main
```

### 4. Automatic Deployment

Cuando el PR del release es mergeado a `main`:

1. **Auto-release workflow** crea el GitHub Release automáticamente
2. **Deploy workflow** detecta el release y:
   - Build de la imagen Docker
   - Push a Docker Hub
   - Deploy al servidor via SSH

**No es necesario crear el release manualmente.**

> **Note**: Si necesitas crear un release manualmente (ej: hotfix), podés usar `gh release create` o la UI de GitHub, pero para releases norminales el proceso es automático.

### 5. Post-Release

#### Merge back to develop

```bash
git checkout develop && git pull
git merge main --no-ff -m "chore: merge release back into develop"
git push origin develop
```

---

## Hotfix Flow

Para critical production fixes:

```bash
# Crear hotfix desde main
git checkout main && git pull
git checkout -b hotfix/0.1.1

# Aplicar fix + update CHANGELOG.md
git add .
git commit -m "fix: description"

# Crear PR a main
gh pr create --base main --head hotfix/0.1.1 --title "🔥 Hotfix 0.1.1"

# Al mergear → auto-release → deploy automático
```

**Naming**: `hotfix/{major}.{minor}.{patch}` (incrementar patch)

---

## Release Checklist

- [ ] Tests passing (`yarn test`)
- [ ] Coverage > 80% (`yarn test:cov`)
- [ ] Lint passing (`yarn lint`)
- [ ] CHANGELOG.md actualizado
- [ ] PR a `main` creado y aprobado
- [ ] Merge a `main` (auto-release se dispara)

---

## Quick Reference

```bash
# Feature
git checkout develop && git pull
git checkout -b feature/name && git push origin feature/name
gh pr create --base develop --head feature/name

# Release
git checkout develop && git pull
git checkout -b release/0.1.0 && git push origin release/0.1.0
gh pr create --base main --head release/0.1.0
# Al mergear: auto-release → deploy

# Hotfix
git checkout main && git pull
git checkout -b hotfix/0.1.1 && git push origin hotfix/0.1.1
gh pr create --base main --head hotfix/0.1.1
# Al mergear: auto-release → deploy

# Post-release
git checkout develop && git merge main --no-ff && git push
```

---

## References

- [Semantic Versioning](https://semver.org/)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
