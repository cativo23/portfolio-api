# Release Workflow

This document describes the professional release workflow for Portfolio API. All releases follow a standardized process to ensure quality, traceability, and maintainability.

## Overview

The release workflow follows the **GitFlow** pattern with the following branches:
- `main`: Production-ready code (stable releases only)
- `develop`: Development branch (integration of features)
- `release/v*.*.*`: Release preparation branches (bug fixes, version bump, documentation)

## Release Process

### 1. Create Release Branch

Create a release branch from `develop` with semantic versioning:

```bash
# Ensure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v1.0.1
```

**Naming Convention**: `release/v{major}.{minor}.{patch}`
- **Major** (v1.x.x): Breaking changes
- **Minor** (vx.1.x): New features, backward compatible
- **Patch** (vx.x.1): Bug fixes, backward compatible

### 2. Prepare Release

#### 2.1 Merge Latest from Develop

```bash
# If there are new commits in develop during release preparation
git merge origin/develop --no-ff -m "chore: merge latest from develop into release/v1.0.1"
```

#### 2.2 Fix Lint Issues

```bash
docker compose exec api yarn lint
# Fix any lint errors
docker compose exec api yarn lint
```

#### 2.3 Run Tests

```bash
docker compose exec api yarn test
# Ensure all tests pass
docker compose exec api yarn test:cov
# Verify coverage is above 80%
```

#### 2.4 Update Version

Update the version in `package.json`:

```bash
# Edit package.json to update version
# Example: "version": "1.0.1"
git add package.json
git commit -m "chore: bump version to 1.0.1"
```

#### 2.5 Update Documentation

Update relevant documentation files:
- Update `docs/code-review.md` if applicable
- Update `README.md` if there are new features or changes
- Update changelog if maintained

### 3. Create Release Tag

Create an annotated tag with release notes:

```bash
git tag -a v1.0.1 -m "🚀 Release v1.0.1

Brief description of the release

## Highlights
- ✅ Feature/improvement 1
- ✅ Feature/improvement 2
- 🐛 Bug fix 1

## Breaking Changes
None (or describe if any)

## Features
- Feature description

## Bug Fixes
- Bug fix description

## Technical Details
- Technical improvements

## Migration Guide (if applicable)
- Steps to migrate"
```

### 4. Push Release Branch and Tag

```bash
# Push the release branch
git push origin release/v1.0.1

# Push the tag
git push origin v1.0.1
```

### 5. Create Pull Request to Main

**Important**: Release branches must go through PR review before merging to `main`.

#### 5.1 Create PR using GitHub CLI

```bash
gh pr create \
  --base main \
  --head release/v1.0.1 \
  --title "🚀 Release v1.0.1" \
  --body "## Release v1.0.1

This PR merges the v1.0.1 release into main.

## Release Notes

[Include release notes from tag message]

## Checklist

- [x] All tests passing
- [x] Lint checks passing
- [x] Test coverage above 80%
- [x] Version bumped in package.json
- [x] Release tag created
- [x] Documentation updated

## Reviewers

Please review and approve this release PR before merging to main.

## Post-Merge

After merging:
1. The release tag should be on main
2. GitHub release will be automatically created (if configured)
3. Deployment workflow will trigger (if configured)"
```

#### 5.2 Alternative: Create PR via GitHub Web UI

1. Go to GitHub repository
2. Click "New Pull Request"
3. Base: `main` ← Compare: `release/v1.0.1`
4. Fill in PR title and description
5. Request reviews
6. Wait for approval
7. Merge when approved

### 6. Post-Merge Steps

After the PR is merged to `main`:

#### 6.1 Verify Tag on Main

```bash
git checkout main
git pull origin main
git tag -l v1.0.1
git log --oneline --decorate | grep v1.0.1
```

#### 6.2 Create/Update GitHub Release (Optional)

If not automatically created:

```bash
gh release create v1.0.1 \
  --title "🚀 Release v1.0.1" \
  --notes "$(git tag -l -n9 v1.0.1)" \
  --target main
```

#### 6.3 Merge Release Back to Develop

Keep develop in sync with releases:

```bash
git checkout develop
git merge main --no-ff -m "chore: merge v1.0.1 release back into develop"
git push origin develop
```

#### 6.4 Delete Release Branch (Optional)

After successful release:

```bash
git push origin --delete release/v1.0.1
git branch -d release/v1.0.1
```

## Release Checklist

Before creating a release, ensure:

- [ ] All features are tested and working
- [ ] All tests pass (`yarn test`)
- [ ] Test coverage is above 80% (`yarn test:cov`)
- [ ] All lint checks pass (`yarn lint`)
- [ ] Build succeeds (`yarn build`)
- [ ] Version is bumped in `package.json`
- [ ] CHANGELOG.md is updated (if maintained)
- [ ] Documentation is updated
- [ ] Release notes are prepared
- [ ] PR is created to main (not direct merge)
- [ ] PR is reviewed and approved
- [ ] Release tag is created

## Semantic Versioning Guidelines

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Increment when making incompatible API changes
  - Example: `1.0.0` → `2.0.0`
  - Breaking changes in API contracts
  - Major dependency updates that break compatibility

- **MINOR**: Increment when adding functionality in a backward-compatible manner
  - Example: `1.0.0` → `1.1.0`
  - New features
  - New endpoints
  - New optional parameters

- **PATCH**: Increment when making backward-compatible bug fixes
  - Example: `1.0.0` → `1.0.1`
  - Bug fixes
  - Security patches
  - Performance improvements
  - Documentation updates

## Hotfix Process

For critical production bugs, use hotfix branches:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/v1.0.2

# Make fixes
# Bump patch version
# Create tag
# Create PR to main

# After merge, merge back to develop
git checkout develop
git merge main
```

## Release Notes Template

```markdown
## 🚀 Release v{Major}.{Minor}.{Patch}

Brief one-line description

## ✨ Highlights

- ✅ Feature/improvement 1
- ✅ Feature/improvement 2

## 🎯 Features

- **Feature Name**: Description

## 🐛 Bug Fixes

- **Fix Name**: Description

## 🔧 Improvements

- Improvement description

## 📊 Technical Details

- Technical improvement

## 🔄 Breaking Changes

None (or describe)

## 📝 Migration Guide (if applicable)

Steps to migrate from previous version
```

## Automated Workflows

The repository uses GitHub Actions for:
- **Tests**: Run on every PR
- **Lint**: Run on every PR
- **Build**: Run on every PR
- **Deploy**: Run on release tags (if configured)

## Best Practices

1. **Never merge directly to main** - Always use PRs
2. **Always test locally** - Before creating release branch
3. **Document changes** - Update documentation with each release
4. **Write release notes** - Help users understand changes
5. **Review PRs carefully** - Ensure quality before release
6. **Keep develop in sync** - Merge releases back to develop
7. **Follow semantic versioning** - Clear versioning strategy
8. **Tag releases properly** - Use annotated tags with notes

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
git tag -a v1.0.1 -m "Updated release notes"
git push origin v1.0.1
```

### Issue: PR merge conflicts

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
