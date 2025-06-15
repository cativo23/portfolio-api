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
        return new ValidationException('Validation failed', {
          errors: formattedErrors,
        });
      },
    });
  }

  /**
   * Format validation errors into a more readable format
   * @param errors Validation errors
   * @returns Formatted errors
   */
  private formatErrors(errors: ValidationError[]) {
    return errors.reduce((acc, error) => {
      if (error.constraints) {
        acc[error.property] = Object.values(error.constraints);
      }
      if (error.children && error.children.length > 0) {
        acc[error.property] = this.formatErrors(error.children);
      }
      return acc;
    }, {});
  }
}
