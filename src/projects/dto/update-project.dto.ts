import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from '@projects/dto/create-project.dto';

/**
 * DTO for updating a project
 *
 * Extends PartialType(CreateProjectDto) which automatically:
 * - Makes all properties optional
 * - Preserves validation decorators
 * - Preserves Swagger documentation from CreateProjectDto
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
