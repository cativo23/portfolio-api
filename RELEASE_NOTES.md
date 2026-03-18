# Release Notes

## Version History

### [1.0.6] - 2026-01-11

#### Features
- **Rate Limiting**: Implemented comprehensive rate limiting using `@nestjs/throttler`
  - Global default: 100 requests per minute for authenticated endpoints
  - Auth endpoints (login/register): 5 requests per minute (prevents brute force attacks)
  - Public endpoints (contact form): 10 requests per minute
  - Health check endpoints: Excluded from rate limiting (monitoring purposes)
  - Configurable via environment variables (`THROTTLE_TTL`, `THROTTLE_LIMIT`, `THROTTLE_PUBLIC_LIMIT`, `THROTTLE_STRICT_LIMIT`)
  - Integrated with global exception filter for standardized error responses (429 Too Many Requests)

#### Improvements
- Added `RATE_LIMIT_ERROR` to error code enum
- Created `RateLimitException` for consistent rate limit error handling
- Updated global exception filter to handle 429 status codes with standardized error format
- Added `AppThrottlerModule` as a global module for rate limiting across all endpoints
- Enhanced security by protecting against brute force attacks and API abuse

#### Documentation
- Added rate limiting documentation to README.md
- Updated code-review.md to mark rate limiting as completed
- Updated roadmap.md to reflect rate limiting implementation
- Created comprehensive RELEASE_NOTES.md file

#### Technical Details
- Uses `@nestjs/throttler@6.5.0` for rate limiting implementation
- Rate limits are applied per IP address by default
- Different rate limits can be applied to specific endpoints using `@Throttle()` decorator
- Health endpoints can be excluded using `@SkipThrottle()` decorator
- Rate limit errors return standardized error responses with `RATE_LIMIT_ERROR` code

---

## Version History (Previous Releases)

### [1.0.5] - Previous Release

*Previous releases will be documented here as the project evolves.*

---

## How to Use Release Notes

When creating a new release:

1. Follow semantic versioning (MAJOR.MINOR.PATCH)
2. Update the version number in `package.json`
3. Add a new entry at the top of this file with:
   - Version number
   - Release date
   - Type (Major/Minor/Patch)
   - Categorized list of changes
4. Update the changelog section in the release PR
5. Reference this file in the GitHub Release notes

For more information about semantic versioning, see [semver.org](https://semver.org/).
