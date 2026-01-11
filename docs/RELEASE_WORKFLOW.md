# Release Workflow

This document describes the release workflow for Portfolio API following industry standards based on GitFlow.

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
git checkout -b release/v1.0.1
git push origin release/v1.0.1
```

**Naming convention**: `release/v{major}.{minor}.{patch}`

**Semantic Versioning**:

- **Major** (v1.x.x → v2.0.0): Incompatible changes, breaking changes
- **Minor** (v1.0.x → v1.1.0): New features, backward compatible
- **Patch** (v1.0.0 → v1.0.1): Bug fixes, backward compatible

#### 3.2 Prepare Release in Branch

On the `release/v1.0.1` branch, perform the following tasks:

##### Update Version

```bash
# Edit package.json to update version
# Example: "version": "1.0.1"
git add package.json
git commit -m "chore: bump version to 1.0.1"
```

##### Verify Lint

```bash
docker compose exec api yarn lint
# Fix any lint errors
```

##### Run Tests

```bash
docker compose exec api yarn test
# Ensure all tests pass
docker compose exec api yarn test:cov
# Verify coverage is above 80%
```

##### Update Documentation

Update relevant documentation:

- `README.md` if there are new features or changes
- `docs/api/endpoints.md` if there are API changes
- Changelog if maintained

```bash
git add .
git commit -m "docs: update documentation for v1.0.1"
```

#### 3.3 Create Pull Request to Main

Once the release is prepared, create PR to `main`:

```bash
gh pr create \
  --base main \
  --head release/v1.0.1 \
  --title "🚀 Release v1.0.1" \
  --body "## Release v1.0.1

This PR prepares release v1.0.1 for production.

## Main Changes

- Change 1
- Change 2
- Fix 1

## Checklist

- [x] Tests passing
- [x] Lint checks passing
- [x] Test coverage above 80%
- [x] Version updated in package.json
- [x] Documentation updated

## Reviewers

Please review and approve before merging to main."
```

Or use GitHub UI:

1. Go to the repository
2. "New Pull Request"
3. Base: `main` ← Compare: `release/v1.0.1`
4. Fill in information
5. Request review
6. Wait for approval

#### 3.4 Merge to Main

**Important**: Only after approval by reviewers, perform merge:

```bash
gh pr merge <PR_NUMBER> --merge

# Update local main
git checkout main
git pull origin main
```

### 4. Create GitHub Release and Deploy

Deployment to production **only occurs** when a **Lead** creates an official GitHub Release. This can be done in two ways:

#### 4.1 Using GitHub CLI (Recommended)

```bash
# Ensure you're on an up-to-date main
git checkout main
git pull origin main

# Create release using gh cli
gh release create v1.0.1 \
  --title "🚀 Release v1.0.1" \
  --notes "## Release v1.0.1

### Highlights

- Feature 1
- Feature 2
- Bug fix 1

### Breaking Changes

None (or describe if any)

### Features

- **New Feature**: Description

### Bug Fixes

- **Fix**: Description" \
  --target main
```

#### 4.2 Using GitHub Web UI

1. Go to the repository on GitHub
2. Click "Releases" (right side)
3. Click "Draft a new release" or "Create a new release"
4. Select tag: If `v1.0.1` already exists, select it. If not, create new tag `v1.0.1` pointing to `main`
5. Title: `🚀 Release v1.0.1`
6. Description: Include release notes (you can use the template below)
7. **Mark as "Latest release"** if it's the most recent version
8. Click **"Publish release"**

#### 4.3 Automatic Deployment

When the GitHub Release is published (using either method above), the GitHub Actions workflow automatically triggers and deploys to production.

**No additional action needed** - the workflow:

1. Checks out code at the release tag
2. Builds the Docker image
3. Publishes the image to Docker Hub
4. Deploys to production

### 5. Post-Release

After successful release and deployment:

#### 5.1 Merge Release Back to Develop

Keep `develop` synchronized with releases:

```bash
git checkout develop
git pull origin develop
git merge main --no-ff -m "chore: merge v1.0.1 release back into develop"
git push origin develop
```

#### 5.2 Delete Release Branch (Optional)

```bash
# Delete remote branch
git push origin --delete release/v1.0.1

# Delete local branch
git branch -d release/v1.0.1
```

## Hotfix Flow

For critical production fixes that cannot wait for the next release:

### 1. Create Hotfix Branch

```bash
# From main (ensure you're up to date)
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/v1.0.2
git push origin hotfix/v1.0.2
```

**Naming convention**: `hotfix/v{major}.{minor}.{patch}` (increment patch)

### 2. Apply Fixes

```bash
# Make corrections
git add .
git commit -m "fix: hotfix description"

# Verify tests and lint
docker compose exec api yarn test
docker compose exec api yarn lint

# Update version in package.json
# Example: "version": "1.0.2"
git add package.json
git commit -m "chore: bump version to 1.0.2"

git push origin hotfix/v1.0.2
```

### 3. Create PR to Main

```bash
gh pr create \
  --base main \
  --head hotfix/v1.0.2 \
  --title "🔥 Hotfix v1.0.2" \
  --body "## Hotfix v1.0.2

### Description

Description of the critical issue and solution.

### Checklist

- [x] Tests passing
- [x] Lint checks passing
- [x] Version updated
- [x] Urgent review requested"
```

### 4. Merge and Release

After approval:

1. Merge PR to `main`
2. Create GitHub Release `v1.0.2` (deploys automatically)
3. Merge `main` back to `develop`
4. Delete `hotfix/v1.0.2` branch

## Release Notes Template

```markdown
## 🚀 Release v{Major}.{Minor}.{Patch}

Brief one-line description

### ✨ Highlights

- Main feature/improvement 1
- Main feature/improvement 2

### 🎯 Features

- **Feature Name**: Detailed description

### 🐛 Bug Fixes

- **Fix Name**: Description of problem and solution

### 🔧 Improvements

- Technical improvement 1
- Technical improvement 2

### 🔄 Breaking Changes

None (or describe if any)

### 📝 Migration Guide (if applicable)

Steps to migrate from previous version
```

## Release Checklist

Before creating a release, ensure:

- [ ] All features are tested and working
- [ ] All tests pass (`yarn test`)
- [ ] Test coverage above 80% (`yarn test:cov`)
- [ ] All lint checks pass (`yarn lint`)
- [ ] Build successful (`yarn build`)
- [ ] Version updated in `package.json`
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] PR to main created and approved
- [ ] Code merged to `main`
- [ ] GitHub Release created (triggers deployment)

## Quick Reference Commands

### Feature Flow

```bash
# Create feature
git checkout develop && git pull
git checkout -b feature/name
# ... work ...
git push origin feature/name
gh pr create --base develop --head feature/name --title "..." --body "..."
# After merge:
git checkout develop && git pull && git branch -d feature/name
```

### Release Flow Commands

```bash
# Create release branch
git checkout develop && git pull
git checkout -b release/v1.0.1
# ... preparation ...
git push origin release/v1.0.1
gh pr create --base main --head release/v1.0.1 --title "..." --body "..."
# After merge to main:
git checkout main && git pull
gh release create v1.0.1 --title "..." --notes "..."
# Post-release:
git checkout develop && git merge main --no-ff && git push
```

### Hotfix Flow Commands

```bash
# Create hotfix
git checkout main && git pull
git checkout -b hotfix/v1.0.2
# ... fixes ...
git push origin hotfix/v1.0.2
gh pr create --base main --head hotfix/v1.0.2 --title "..." --body "..."
# After merge:
git checkout main && git pull
gh release create v1.0.2 --title "..." --notes "..."
git checkout develop && git merge main --no-ff && git push
```

## Best Practices

1. **Never merge directly to `main`** - Always use PRs
2. **Always test locally** - Before creating PR
3. **Document changes** - Update documentation with each release
4. **Write clear release notes** - Help understand changes
5. **Review PRs carefully** - Ensure quality before release
6. **Keep develop synchronized** - Merge releases back to develop
7. **Follow semantic versioning** - Clear versioning strategy
8. **Only Leads create releases** - Control over production deployments
9. **Minimum one approval** - PRs require at least one human approval
10. **Deploy only via GitHub Release** - No automatic deployments on push

## Troubleshooting

### Issue: Release branch is behind develop

```bash
git checkout release/v1.0.1
git merge origin/develop --no-ff
# Resolve conflicts if any
git push origin release/v1.0.1
```

### Issue: Need to update release tag

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag (be careful!)
git push origin :refs/tags/v1.0.1

# Create new tag
git checkout main
git tag -a v1.0.1 -m "Updated release notes"
git push origin v1.0.1

# Delete and recreate GitHub Release
gh release delete v1.0.1
gh release create v1.0.1 --title "..." --notes "..."
```

### Issue: Conflicts in PR from release to main

```bash
git checkout main
git pull origin main
git checkout release/v1.0.1
git merge main
# Resolve conflicts
git push origin release/v1.0.1
```

## References

- [Semantic Versioning](https://semver.org/)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub CLI](https://cli.github.com/)
