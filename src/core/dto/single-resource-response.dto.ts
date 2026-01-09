import { ApiHideProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from './success-response.dto';

/**
 * Base DTO for single resource responses
 *
 * This class eliminates repetition across single resource response DTOs by:
 * 1. Extending SuccessResponseDto with the data property
 * 2. Excluding meta field from Swagger (single resources don't have pagination)
 * 3. Providing a clean, reusable pattern for all single resource responses
 *
 * Implementation choice: We create this base class instead of repeating code because:
 * 1. DRY principle - eliminates code duplication
 * 2. Consistency - all single resource responses behave the same way
 * 3. Maintainability - changes to single resource structure only need to be made once
 * 4. Type safety - ensures correct implementation
 *
 * @template T Type of the resource data (e.g., ProjectResponseDto, ContactResponseDto)
 */
export class SingleResourceResponseDto<T> extends SuccessResponseDto<T> {
  /**
   * Exclude meta field from Swagger documentation for single resources
   * Single resources don't have pagination, so meta should not appear in docs
   *
   * Note: @ApiHideProperty() may not fully work with inherited properties in Swagger.
   * However, the actual response will never include meta since we don't set it in the constructor.
   * This is a known limitation of Swagger's schema generation with inheritance.
   */
  @ApiHideProperty()
  override meta?: undefined;

  /**
   * Constructor for single resource response
   * @param data The resource data
   */
  constructor(data: T) {
    super(data); // Don't pass meta, so it won't be set (meta is optional)
  }
}
