import { ValidationPipe } from './validation.pipe';
import { ValidationException } from '../exceptions/validation.exception';

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('exceptionFactory', () => {
    it('should throw ValidationException with formatted errors', () => {
      const errors = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be an email',
          },
          children: [],
        },
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
            minLength: 'name must be longer than or equal to 2 characters',
          },
          children: [],
        },
      ] as any;

      // Access the exceptionFactory through the pipe instance
      // Since it's private, we'll test it indirectly through transform
      // Or we can access it through the protected options
      const exceptionFactory = (pipe as any).exceptionFactory;

      const exception = exceptionFactory(errors);

      expect(exception).toBeInstanceOf(ValidationException);
      expect(exception.message).toBe('Invalid input data');
      expect(exception.details).toEqual({
        email: 'email must be an email',
        name: 'name should not be empty', // Takes first constraint
      });
    });

    it('should handle nested errors', () => {
      const errors = [
        {
          property: 'user',
          constraints: {},
          children: [
            {
              property: 'email',
              constraints: {
                isEmail: 'email must be an email',
              },
              children: [],
            },
            {
              property: 'address',
              constraints: {},
              children: [
                {
                  property: 'city',
                  constraints: {
                    isNotEmpty: 'city should not be empty',
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ] as any;

      const exceptionFactory = (pipe as any).exceptionFactory;
      const exception = exceptionFactory(errors);

      expect(exception).toBeInstanceOf(ValidationException);
      // The formatErrors method includes properties with no constraints as "Invalid value"
      expect(exception.details).toEqual({
        user: 'Invalid value',
        email: 'email must be an email',
        address: 'Invalid value',
        city: 'city should not be empty',
      });
    });

    it('should handle errors without constraints', () => {
      const errors = [
        {
          property: 'field',
          constraints: undefined,
          children: [],
        },
      ] as any;

      const exceptionFactory = (pipe as any).exceptionFactory;
      const exception = exceptionFactory(errors);

      expect(exception).toBeInstanceOf(ValidationException);
      expect(exception.details).toEqual({});
    });
  });

  describe('formatErrors', () => {
    it('should format errors correctly', () => {
      const errors = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be an email',
          },
          children: [],
        },
      ] as any;

      const formatErrors = (pipe as any).formatErrors.bind(pipe);
      const formatted = formatErrors(errors);

      expect(formatted).toEqual({
        email: 'email must be an email',
      });
    });

    it('should take first constraint when multiple exist', () => {
      const errors = [
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
            minLength: 'name must be longer than or equal to 2 characters',
          },
          children: [],
        },
      ] as any;

      const formatErrors = (pipe as any).formatErrors.bind(pipe);
      const formatted = formatErrors(errors);

      expect(formatted).toEqual({
        name: 'name should not be empty',
      });
    });
  });
});
