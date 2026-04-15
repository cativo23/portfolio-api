import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

describe('CreateContactDto', () => {
  describe('XSS sanitization', () => {
    it('should strip script tags and content from name', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: '<script>alert(1)</script>',
        email: 'test@example.com',
        message: 'This is a valid message with enough characters',
      });

      expect(dto.name).toBe('');
    });

    it('should strip script tags and content from message', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'test@example.com',
        message: '<script>document.cookie</script>',
      });

      expect(dto.message).toBe('');
    });

    it('should strip event handlers from message', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'test@example.com',
        message: '<img src=x onerror=alert(1)>',
      });

      expect(dto.message).toBe('');
    });

    it('should strip img tags from message', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Hello <img src="evil.png"> world',
      });

      expect(dto.message).toBe('Hello  world');
    });

    it('should strip HTML from subject', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Valid message here with enough chars',
        subject: '<b>Important</b>',
      });

      expect(dto.subject).toBe('Important');
    });

    it('should leave plain text unchanged', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Hello, I would like to get in touch...',
        subject: 'Project Inquiry',
      });

      expect(dto.name).toBe('John Doe');
      expect(dto.message).toBe('Hello, I would like to get in touch...');
      expect(dto.subject).toBe('Project Inquiry');
    });
  });

  describe('validation', () => {
    it('should accept valid input', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message with enough text to pass',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject name too short', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'a',
        email: 'test@example.com',
        message: 'This is a valid message with enough text to pass',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid email', async () => {
      const dto = plainToClass(CreateContactDto, {
        name: 'John Doe',
        email: 'not-an-email',
        message: 'This is a valid message with enough text to pass',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
