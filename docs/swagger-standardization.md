# Swagger Documentation Standardization

This document explains how to use the standardized Swagger decorators to automatically document API responses without manually adding `@ApiResponse` decorators to every endpoint.

## Overview

Since all responses follow a standardized format (via the `ResponseTransformInterceptor`), we can use reusable decorators to automatically document common response patterns in Swagger.

## Benefits

1. **DRY Principle**: No need to repeat `@ApiResponse` decorators on every endpoint
2. **Consistency**: All endpoints automatically get standard error responses documented
3. **Maintainability**: Update response documentation in one place
4. **Less Boilerplate**: Cleaner controller code

## Standard Response Decorators

### `@ApiGetSingleResource`

For endpoints that return a single resource (GET /:id).

```typescript
@ApiGetSingleResource(200, 'Returns a single project', SingleProjectResponseDto)
@Get(':id')
async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
  return this.projectsService.findOne(+id);
}
```

**Automatically adds:**
- Success response (200)
- Not Found (404)
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

### `@ApiGetPaginatedList`

For endpoints that return a paginated list (GET /).

```typescript
@ApiGetPaginatedList('Returns a paginated list of projects', ProjectsListResponseDto)
@Get()
async findAll(): Promise<ProjectsListResponseDto> {
  return this.projectsService.findAll();
}
```

**Automatically adds:**
- Success response (200) with pagination metadata
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

### `@ApiCreateResource`

For POST endpoints that create a resource.

```typescript
@ApiCreateResource(201, 'Project created successfully', SingleProjectResponseDto)
@Post()
async create(@Body() createProjectDto: CreateProjectDto): Promise<SingleProjectResponseDto> {
  return this.projectsService.create(createProjectDto);
}
```

**Automatically adds:**
- Success response (201 Created)
- Validation Error (422)
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

### `@ApiUpdateResource`

For PATCH/PUT endpoints that update a resource.

```typescript
@ApiUpdateResource('Project updated successfully', SingleProjectResponseDto)
@Patch(':id')
async update(
  @Param('id') id: string,
  @Body() updateProjectDto: UpdateProjectDto
): Promise<SingleProjectResponseDto> {
  return this.projectsService.update(+id, updateProjectDto);
}
```

**Automatically adds:**
- Success response (200)
- Validation Error (422)
- Not Found (404)
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

### `@ApiDeleteResource`

For DELETE endpoints.

```typescript
@ApiDeleteResource('Project deleted successfully', DeleteResponseDto)
@Delete(':id')
async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
  return this.projectsService.remove(+id);
}
```

**Automatically adds:**
- Success response (200)
- Not Found (404)
- Bad Request (400)
- Unauthorized (401)
- Forbidden (403)
- Internal Server Error (500)

### `@ApiCustomResponses`

For endpoints that don't fit the standard patterns.

```typescript
@ApiCustomResponses(
  ApiResponse({ status: 200, type: CustomResponseDto }),
  ApiNotFoundResponse({ type: ErrorResponseDto }),
)
@Get('custom')
async custom(): Promise<CustomResponseDto> {
  // ...
}
```

This decorator adds your custom responses **plus** all standard error responses.

## Migration Example

### Before (Manual Decorators)

```typescript
@Get(':id')
@UseGuards(JwtOrApiKeyGuard)
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@ApiOperation({ summary: 'Get a project by ID' })
@ApiParam({ name: 'id', type: String, description: 'Project ID' })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'The found project',
  type: SingleProjectResponseDto,
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Project not found',
  type: ErrorResponseDto,
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
  return this.projectsService.findOne(+id);
}
```

### After (Standardized Decorators)

```typescript
@Get(':id')
@UseGuards(JwtOrApiKeyGuard)
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@ApiOperation({ summary: 'Get a project by ID' })
@ApiParam({ name: 'id', type: String, description: 'Project ID' })
@ApiGetSingleResource(200, 'The found project', SingleProjectResponseDto)
async findOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
  return this.projectsService.findOne(+id);
}
```

**Reduced from ~20 lines of decorators to 1 line!**

## Response Documentation

All responses are automatically documented with:

### Success Responses

- Include `request_id` field
- Include `data` field with the resource(s)
- Include `meta.pagination` for paginated responses (automatically detected)

### Error Responses

- Include `request_id` field
- Include `error` object with:
  - `code`: Error code (VALIDATION_ERROR, NOT_FOUND, etc.)
  - `message`: Human-readable message
  - `details`: Optional field-specific errors (for validation)
  - `path`: Request path
  - `timestamp`: ISO 8601 timestamp

## Request ID Documentation

The `request_id` field is automatically documented in all responses (success and error) through the `BaseResponseDto`. It's included in Swagger examples:

```json
{
  "status": "success",
  "request_id": "req_88229911aabb",
  "data": { ... }
}
```

## Swagger UI Enhancements

The Swagger configuration includes:

- **Persistent Authorization**: Auth tokens are saved in Swagger UI
- **Request Duration**: Shows how long requests take
- **Filter/Search**: Easy to find endpoints
- **Common Response Documentation**: Response format explained in API description

## Best Practices

1. **Use Standard Decorators**: Prefer `@ApiGetSingleResource`, `@ApiGetPaginatedList`, etc. over manual `@ApiResponse` decorators
2. **Keep Descriptions Clear**: Provide clear, concise descriptions for the success response
3. **Custom Responses Only When Needed**: Use `@ApiCustomResponses` only for non-standard endpoints
4. **Document Request ID**: Already handled automatically, but mention it in API docs for users

## Example: Complete Controller

```typescript
import {
  ApiGetSingleResource,
  ApiGetPaginatedList,
  ApiCreateResource,
  ApiUpdateResource,
  ApiDeleteResource,
} from '@core/decorators';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  @Get()
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiGetPaginatedList('Returns a paginated list of projects', ProjectsListResponseDto)
  async findAll(...): Promise<ProjectsListResponseDto> { ... }

  @Get(':id')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiGetSingleResource(200, 'The found project', SingleProjectResponseDto)
  async findOne(...): Promise<SingleProjectResponseDto> { ... }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiCreateResource(201, 'Project created successfully', SingleProjectResponseDto)
  async create(...): Promise<SingleProjectResponseDto> { ... }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProjectDto })
  @ApiUpdateResource('Project updated successfully', SingleProjectResponseDto)
  async update(...): Promise<SingleProjectResponseDto> { ... }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', type: String })
  @ApiDeleteResource('Project deleted successfully', DeleteResponseDto)
  async remove(...): Promise<DeleteResponseDto> { ... }
}
```

Notice how much cleaner this is compared to manually adding `@ApiResponse` decorators for every endpoint!

## Conclusion

By using these standardized decorators:

- ✅ **Less boilerplate**: Reduced from 20+ lines to 1 line per endpoint
- ✅ **Consistency**: All endpoints automatically get standard error documentation
- ✅ **Maintainability**: Update standard responses in one place
- ✅ **Better DX**: Easier to read and understand controller code
- ✅ **Complete Documentation**: All responses properly documented in Swagger
