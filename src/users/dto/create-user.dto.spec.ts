import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  describe('validation', () => {
    it('should validate valid input', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject when username is missing even if email and password are valid', async () => {
      const dto = plainToClass(CreateUserDto, {
        email: 'john@example.com',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'invalid-email',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject missing email', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject empty email', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: '',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should reject password shorter than 6 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: '12345',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept password with exactly 6 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: '123456',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept password with more than 6 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securePassword123WithMany',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing password', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject empty password', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'john.doe@example.co.uk',
        'test+tag@example.com',
        'user_name@example.com',
      ];

      for (const email of validEmails) {
        const dto = plainToClass(CreateUserDto, {
          username: 'johndoe',
          email,
          password: 'securePassword123',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject various invalid email formats', async () => {
      const invalidEmails = [
        'plainaddress',
        '@example.com',
        'user@',
        'user name@example.com',
        'user@example',
      ];

      for (const email of invalidEmails) {
        const dto = plainToClass(CreateUserDto, {
          username: 'johndoe',
          email,
          password: 'securePassword123',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should reject empty username string', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: '',
        email: 'john@example.com',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should accept username as string', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(typeof dto.username).toBe('string');
    });

    it('should preserve email case', async () => {
      const dto = plainToClass(CreateUserDto, {
        username: 'johndoe',
        email: 'John.Doe@Example.COM',
        password: 'securePassword123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.email).toBe('John.Doe@Example.COM');
    });
  });
});
