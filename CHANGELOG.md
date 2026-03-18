# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Removed duplicate `InitialSchema1700000000000` migration (overlapped with `Migration1767058079581` and ran first by timestamp, breaking `migration:run` on existing databases)

### Added
- API key hashing with HMAC-SHA256 for secure storage
- Dynamic Swagger server URL from PORT environment variable
- Redis support for caching
- Comprehensive production Docker Compose configuration

### Changed
- Updated security score from 4/10 to 7/10 in code review
- Improved production deployment workflow

### Security
- Fixed critical vulnerability: API keys now stored hashed instead of plaintext
- Added Helmet-ready configuration (pending implementation)

---

## [0.1.0] - 2026-03-18

### Added
- Initial release
- NestJS 11 REST API with TypeORM and MySQL
- JWT + local authentication strategies
- API key management with HMAC-SHA256 hashing
- Rate limiting with @nestjs/throttler
- Comprehensive test suite (90%+ coverage)
- Automated CI/CD with GitHub Actions
- Auto-release workflow for release branches
