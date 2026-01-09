import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiUnprocessableEntityResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { BaseResponseDto } from '../dto/base-response.dto';

/**
 * Standard error responses that are common across all endpoints
 * These are automatically added to Swagger documentation
 */
const STANDARD_ERROR_RESPONSES = [
  ApiBadRequestResponse({
    description: 'Bad request - Invalid input parameters',
    type: ErrorResponseDto,
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing or invalid authentication token',
    type: ErrorResponseDto,
  }),
  ApiForbiddenResponse({
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto,
  }),
  ApiInternalServerErrorResponse({
    description: 'Internal server error - An unexpected error occurred',
    type: ErrorResponseDto,
  }),
];

/**
 * Decorator for endpoints that return a single resource
 * Automatically adds success response and standard error responses
 * Uses a custom schema to exclude meta field (single resources don't have pagination)
 *
 * @param status - HTTP status code (default: 200)
 * @param description - Response description
 * @param responseType - Response DTO type (should be a SingleResourceResponseDto subclass)
 * @param dataType - The inner data type (e.g., ProjectResponseDto, ContactResponseDto)
 *
 * @example
 * @ApiGetSingleResource(200, 'Returns a single project', SingleProjectResponseDto, ProjectResponseDto)
 * @Get(':id')
 * async findOne(@Param('id') id: string) { ... }
 */
export function ApiGetSingleResource<TResponse, TData>(
  status: number = HttpStatus.OK,
  description: string,
  responseType: new (...args: any[]) => TResponse,
  dataType: new (...args: any[]) => TData,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              status: { type: 'string', enum: ['success'], example: 'success' },
              request_id: { type: 'string', example: 'req_88229911' },
              data: {
                // Reference the inner data type, not the full response type
                $ref: getSchemaPath(dataType),
              },
              // meta is explicitly excluded by not including it in properties
            },
            required: ['status', 'request_id', 'data'],
            additionalProperties: false, // Ensure no additional properties like meta are included
          },
        ],
      },
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ...STANDARD_ERROR_RESPONSES,
  );
}

/**
 * Decorator for endpoints that return a paginated list
 * Automatically adds success response and standard error responses
 *
 * @param description - Response description
 * @param type - Response DTO type
 *
 * @example
 * @ApiGetPaginatedList('Returns a paginated list of projects', ProjectsListResponseDto)
 * @Get()
 * async findAll() { ... }
 */
export function ApiGetPaginatedList<T>(
  description: string,
  type: new (...args: any[]) => T,
) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description,
      type,
    }),
    ...STANDARD_ERROR_RESPONSES,
  );
}

/**
 * Decorator for POST endpoints that create a resource
 * Automatically adds success, validation, and standard error responses
 *
 * @param status - HTTP status code (default: 201)
 * @param description - Response description
 * @param responseType - Response DTO type (should be a SingleResourceResponseDto subclass)
 * @param dataType - The inner data type (e.g., ProjectResponseDto, ContactResponseDto)
 *
 * @example
 * @ApiCreateResource(201, 'Project created successfully', SingleProjectResponseDto, ProjectResponseDto)
 * @Post()
 * async create(@Body() dto: CreateProjectDto) { ... }
 */
export function ApiCreateResource<TResponse, TData>(
  status: number = HttpStatus.CREATED,
  description: string,
  responseType: new (...args: any[]) => TResponse,
  dataType: new (...args: any[]) => TData,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              status: { type: 'string', enum: ['success'], example: 'success' },
              request_id: { type: 'string', example: 'req_88229911' },
              data: {
                $ref: getSchemaPath(dataType),
              },
            },
            required: ['status', 'request_id', 'data'],
            additionalProperties: false,
          },
        ],
      },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed - Invalid input data',
      type: ErrorResponseDto,
    }),
    ...STANDARD_ERROR_RESPONSES,
  );
}

/**
 * Decorator for PATCH/PUT endpoints that update a resource
 * Automatically adds success, validation, not found, and standard error responses
 *
 * @param description - Response description
 * @param responseType - Response DTO type (should be a SingleResourceResponseDto subclass)
 * @param dataType - The inner data type (e.g., ProjectResponseDto, ContactResponseDto)
 *
 * @example
 * @ApiUpdateResource('Project updated successfully', SingleProjectResponseDto, ProjectResponseDto)
 * @Patch(':id')
 * async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { ... }
 */
export function ApiUpdateResource<TResponse, TData>(
  description: string,
  responseType: new (...args: any[]) => TResponse,
  dataType: new (...args: any[]) => TData,
) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              status: { type: 'string', enum: ['success'], example: 'success' },
              request_id: { type: 'string', example: 'req_88229911' },
              data: {
                $ref: getSchemaPath(dataType),
              },
            },
            required: ['status', 'request_id', 'data'],
            additionalProperties: false,
          },
        ],
      },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed - Invalid input data',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ...STANDARD_ERROR_RESPONSES,
  );
}

/**
 * Decorator for DELETE endpoints
 * Automatically adds success, not found, and standard error responses
 *
 * @param description - Response description
 * @param type - Response DTO type
 *
 * @example
 * @ApiDeleteResource('Project deleted successfully', DeleteResponseDto)
 * @Delete(':id')
 * async remove(@Param('id') id: string) { ... }
 */
export function ApiDeleteResource<T>(
  description: string,
  type: new (...args: any[]) => T,
) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description,
      type,
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ...STANDARD_ERROR_RESPONSES,
  );
}

/**
 * Custom decorator that combines multiple standard responses
 * Useful for endpoints that don't fit the standard patterns
 *
 * @param responses - Array of ApiResponse decorators
 *
 * @example
 * @ApiCustomResponses([
 *   ApiResponse({ status: 200, type: CustomResponseDto }),
 *   ApiNotFoundResponse({ type: ErrorResponseDto }),
 * ])
 */
export function ApiCustomResponses(...responses: any[]) {
  return applyDecorators(...responses, ...STANDARD_ERROR_RESPONSES);
}
