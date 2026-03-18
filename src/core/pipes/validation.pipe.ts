import {
  ValidationPipe as NestValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { ValidationException } from '@core/exceptions/validation.exception';

/**
 * Custom validation pipe that throws ValidationException instead of BadRequestException
 */
export class ValidationPipe extends NestValidationPipe {
  /**
   * Creates a new instance of ValidationPipe
   *
   * @param options - Configuration options for the validation pipe
   * @param options.transform - Whether to transform objects to their corresponding class instances
   * @param options.whitelist - Whether to strip properties that do not have any decorators
   * @param options.forbidNonWhitelisted - Whether to throw an error if non-whitelisted properties are present
   */
  constructor(options = {}) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      ...options,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(errors);
        return new ValidationException('Invalid input data', {
          ...formattedErrors,
        });
      },
    });
  }

  /**
   * Format validation errors into a more readable format
   *
   * Implementation choice: We format errors as single strings per field instead of arrays
   * because:
   * 1. It matches the example format provided (field: "error message")
   * 2. It's more concise and easier to read
   * 3. Most validation errors have one primary message per field
   * 4. It's a common pattern in production APIs
   *
   * If multiple constraints fail, we take the first one as it's usually the most relevant.
   *
   * @param errors Validation errors
   * @returns Formatted errors
   */
  private formatErrors(errors: ValidationError[]): Record<string, string> {
    return errors.reduce(
      (acc, error) => {
        if (error.constraints) {
          // Take the first constraint message (usually the most relevant)
          // Format: field -> "error message" (single string, not array)
          const constraintValues = Object.values(error.constraints);
          acc[error.property] = constraintValues[0] || 'Invalid value';
        }
        if (error.children && error.children.length > 0) {
          // Recursively format nested errors
          const nestedErrors = this.formatErrors(error.children);
          Object.assign(acc, nestedErrors);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
