# Standard Response Decorators

Reusable Swagger decorators for automatically documenting standardized API responses.

## Quick Start

Import the decorators:

```typescript
import {
  ApiGetSingleResource,
  ApiGetPaginatedList,
  ApiCreateResource,
  ApiUpdateResource,
  ApiDeleteResource,
} from '@core/decorators';
```

## Usage Examples

### GET Single Resource

**Before:**
```typescript
@Get(':id')
@ApiResponse({ status: 200, type: SingleProjectResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
async findOne(@Param('id') id: string) { ... }
```

**After:**
```typescript
@Get(':id')
@ApiGetSingleResource(200, 'Returns a single project', SingleProjectResponseDto)
async findOne(@Param('id') id: string) { ... }
```

### GET Paginated List

**Before:**
```typescript
@Get()
@ApiResponse({ status: 200, type: ProjectsListResponseDto })
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
async findAll() { ... }
```

**After:**
```typescript
@Get()
@ApiGetPaginatedList('Returns a paginated list of projects', ProjectsListResponseDto)
async findAll() { ... }
```

### POST Create Resource

**Before:**
```typescript
@Post()
@ApiResponse({ status: 201, type: SingleProjectResponseDto })
@ApiResponse({ status: 422, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
async create(@Body() dto: CreateProjectDto) { ... }
```

**After:**
```typescript
@Post()
@ApiCreateResource(201, 'Project created successfully', SingleProjectResponseDto)
async create(@Body() dto: CreateProjectDto) { ... }
```

### PATCH/PUT Update Resource

**Before:**
```typescript
@Patch(':id')
@ApiResponse({ status: 200, type: SingleProjectResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@ApiResponse({ status: 422, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { ... }
```

**After:**
```typescript
@Patch(':id')
@ApiUpdateResource('Project updated successfully', SingleProjectResponseDto)
async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { ... }
```

### DELETE Resource

**Before:**
```typescript
@Delete(':id')
@ApiResponse({ status: 200, type: DeleteResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
async remove(@Param('id') id: string) { ... }
```

**After:**
```typescript
@Delete(':id')
@ApiDeleteResource('Project deleted successfully', DeleteResponseDto)
async remove(@Param('id') id: string) { ... }
```

## What Gets Added Automatically

All decorators automatically add these standard error responses:

- **400 Bad Request**: Invalid input parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Unexpected server error

Additional responses based on decorator:

- **@ApiGetSingleResource**: Adds 404 Not Found
- **@ApiCreateResource**: Adds 422 Validation Error
- **@ApiUpdateResource**: Adds 404 Not Found + 422 Validation Error
- **@ApiDeleteResource**: Adds 404 Not Found

## Benefits

✅ **Less boilerplate**: 1 decorator instead of 3-6 decorators
✅ **Consistency**: All endpoints get standard error documentation
✅ **Maintainability**: Update standard responses in one place
✅ **Request ID**: Automatically documented via BaseResponseDto
