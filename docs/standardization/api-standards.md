# API Standards and Documentation

This document covers the standardization of API responses, Swagger documentation patterns, and request context implementation in the Portfolio API.

## Table of Contents

1. [Response Standardization](#response-standardization)
2. [Swagger Documentation Standards](#swagger-documentation-standards)
3. [Request Context Implementation](#request-context-implementation)

---

## Response Standardization

All API responses follow a standardized format that includes:
- **Status**: `success` or `error`
- **Request ID**: Unique identifier for tracking and debugging (48-bit, 12 hex chars)
- **Data**: Response payload (for success responses)
- **Error**: Error information (for error responses)
- **Meta**: Optional metadata, including pagination information

### Success Response (Individual Resource)

```json
{
  "status": "success",
  "request_id": "req_88229911aabb",
  "data": {
    "id": 1,
    "title": "Project Title",
    "description": "Project description",
    "created_at": "2026-01-08T14:00:00Z"
  }
}
```

### Success Response (Paginated Collection)

```json
{
  "status": "success",
  "request_id": "req_88229911aabb",
  "data": [
    { "id": 1, "title": "Project 1" },
    { "id": 2, "title": "Project 2" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_items": 45,
      "total_pages": 5
    }
  }
}
```

### Error Response

```json
{
  "status": "error",
  "request_id": "req_99bbaacc",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "must be a valid email",
      "password": "is too short (minimum 8 characters)"
    },
    "path": "/api/auth/register",
    "timestamp": "2026-01-08T14:05:00Z"
  }
}
```

### Implementation Details

#### Request ID Generation

**Current Implementation**: Uses `crypto.randomBytes(6)` to generate 48-bit (12 hex character) request IDs via `RequestIdMiddleware`.

**Why 48 bits?**
- **Collision Resistance**: ~281 trillion possibilities → ~16 million requests for 50% collision probability
- **Production-Ready**: Suitable for high-traffic production APIs
- **Readable**: 12 hex chars (e.g., `req_88229911aabb`) - short enough to communicate
- **Secure**: Cryptographically secure random number generator

**Format**: `req_` prefix + 12 hex characters

**Location**: `src/core/middleware/request-id.middleware.ts`

#### Response Transformation Interceptor

**Implementation**: Global NestJS interceptor that automatically wraps all responses in standardized format.

**Location**: `src/core/interceptors/response-transform.interceptor.ts`

**Benefits**:
- DRY Principle: No need to wrap every response manually
- Consistency: All responses automatically follow the same format
- Maintainability: Changes to response format only need to be made in one place
- Separation of Concerns: Controllers focus on business logic

#### Global Exception Filter

**Implementation**: Custom exception filter that catches all exceptions and formats them consistently.

**Location**: `src/core/exceptions/global-exception.filter.ts`

**Benefits**:
- Centralized error handling
- Consistent error format across all endpoints
- Security: Prevents leaking sensitive error details
- Observability: Automatically includes request_id, path, and timestamp

#### Pagination Format

**Implementation**: Snake_case format (`total_items`, `total_pages`) following REST API conventions.

**Components**:
- `PaginationUtil` (`src/core/utils/pagination.util.ts`): Reusable pagination utility
- `PaginatedResponseDto` (`src/core/dto/paginated-response.dto.ts`): Base class for paginated responses

---

## Swagger Documentation Standards

Since all responses follow a standardized format, we use reusable decorators to automatically document API responses without manually adding `@ApiResponse` decorators to every endpoint.

### Standard Response Decorators

#### `@ApiGetSingleResource`

For endpoints that return a single resource (GET /:id).

```typescript
@ApiGetSingleResource(200, 'Returns a single project', SingleProjectResponseDto)
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number): Promise<SingleProjectResponseDto> {
  return this.projectsService.findOne(id);
}
```

**Automatically documents**:
- Success response (200)
- Not Found (404)
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

#### `@ApiGetPaginatedList`

For endpoints that return a paginated list (GET /).

```typescript
@ApiGetPaginatedList('Returns a paginated list of projects', ProjectsListResponseDto)
@Get()
async findAll(@Query() query: FindAllProjectsQueryDto): Promise<ProjectsListResponseDto> {
  return this.projectsService.findAll(query);
}
```

**Automatically documents**:
- Success response (200) with pagination metadata
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

#### `@ApiCreateResource`

For POST endpoints that create a resource.

```typescript
@ApiCreateResource(201, 'Project created successfully', SingleProjectResponseDto)
@Post()
async create(@Body() createProjectDto: CreateProjectDto): Promise<SingleProjectResponseDto> {
  return this.projectsService.create(createProjectDto);
}
```

#### `@ApiUpdateResource`

For PATCH/PUT endpoints that update a resource.

```typescript
@ApiUpdateResource('Project updated successfully', SingleProjectResponseDto)
@Patch(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateProjectDto: UpdateProjectDto
): Promise<SingleProjectResponseDto> {
  return this.projectsService.update(id, updateProjectDto);
}
```

#### `@ApiDeleteResource`

For DELETE endpoints.

```typescript
@ApiDeleteResource('Project deleted successfully', DeleteResponseDto)
@Delete(':id')
async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResponseDto> {
  return this.projectsService.remove(id);
}
```

### Benefits

1. **Less Boilerplate**: Reduced from 20+ lines to 1 line per endpoint
2. **Consistency**: All endpoints automatically get standard error documentation
3. **Maintainability**: Update standard responses in one place
4. **Better DX**: Easier to read and understand controller code
5. **Complete Documentation**: All responses properly documented in Swagger

**Location**: `src/core/decorators/api-standard-responses.decorator.ts`

---

## Request Context Implementation

The implementation uses **nestjs-cls** which leverages Node.js's built-in **AsyncLocalStorage** to provide type-safe, request-scoped context management.

### Why AsyncLocalStorage?

1. **Production-Proven Pattern**: Used by major companies in production
2. **Type-Safe Context Access**: No type casting needed
3. **Works with Async/Await**: Automatically propagates context through async operations
4. **Clean Architecture**: No need to pass request object through every function
5. **Thread-Safe**: Isolated per request, handles concurrent requests safely

### Request ID Strategy

**Implementation**: 48 bits (12 hex characters) using `crypto.randomBytes(6)`

**Format**: `req_` prefix + 12 hex characters (e.g., `req_88229911aabb`)

**Why 48 bits?**
- **Collision Resistance**: ~281 trillion possibilities
- **High-Traffic Ready**: Can handle millions of requests
- **Still Readable**: Short enough to communicate to support
- **Performance**: Direct byte generation is fast

### Architecture

**Components**:
1. **RequestContextModule** (`src/core/context/request-context.module.ts`): Global module that initializes CLS
2. **RequestContextService** (`src/core/context/request-context.service.ts`): Type-safe service for accessing context
3. **RequestIdMiddleware** (`src/core/middleware/request-id.middleware.ts`): Generates request ID and stores context
4. **RequestContext Interface** (`src/core/context/request-context.interface.ts`): Type-safe interface for context data

### Request Flow

```
1. Request arrives
   ↓
2. RequestIdMiddleware
   - Generates request ID (48 bits)
   - Creates RequestContext object
   - Stores in AsyncLocalStorage via ClsService
   ↓
3. Controller/Service/Interceptor/Filter
   - Access context via RequestContextService
   - Type-safe, no casting needed
   ↓
4. Response sent with request_id in body and X-Request-ID header
```

### Usage Examples

#### In Services (Recommended)

```typescript
@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: Repository<Project>,
    private readonly requestContext: RequestContextService,
  ) {}

  async findAll() {
    const requestId = this.requestContext.getRequestId();
    this.logger.log(`[${requestId}] Finding all projects`);
    // ... business logic
  }
}
```

#### In Interceptors

```typescript
@Injectable()
export class ResponseTransformInterceptor {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const requestId = this.requestContext.getRequestId(); // Type-safe!
    // ... transform response
  }
}
```

### Benefits

1. **Type Safety**: No `(req as any).requestId` casting
2. **Clean Code**: No need to pass request object everywhere
3. **Testability**: Easy to mock RequestContextService
4. **Production-Ready**: Used by major companies
5. **Maintainability**: Single source of truth for context

---

## Current Implementation Status

### ✅ Completed

- ✅ Response standardization with DTOs (`SuccessResponseDto`, `ErrorResponseDto`)
- ✅ Response transformation interceptor
- ✅ Global exception filter with custom exceptions
- ✅ Request ID middleware using AsyncLocalStorage
- ✅ Swagger standardized decorators
- ✅ Pagination utility (`PaginationUtil`)
- ✅ Base CRUD service (`BaseCrudService`)
- ✅ Base paginated response DTO (`PaginatedResponseDto`)
- ✅ Request context service with type-safe access

### Key Files

- `src/core/interceptors/response-transform.interceptor.ts` - Response transformation
- `src/core/exceptions/global-exception.filter.ts` - Error handling
- `src/core/middleware/request-id.middleware.ts` - Request ID generation
- `src/core/context/request-context.service.ts` - Context access
- `src/core/utils/pagination.util.ts` - Pagination logic
- `src/core/services/base-crud.service.ts` - Base CRUD operations
- `src/core/dto/paginated-response.dto.ts` - Paginated response base class
- `src/core/decorators/api-standard-responses.decorator.ts` - Swagger decorators

---

**Last Updated**: 2026-01-08
