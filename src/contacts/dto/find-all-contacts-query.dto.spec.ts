import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { FindAllContactsQueryDto } from './find-all-contacts-query.dto';

describe('FindAllContactsQueryDto', () => {
  describe('is_read transformation', () => {
    it('should transform string "true" to boolean true', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { is_read: 'true' });

      expect(dto.is_read).toBe(true);
    });

    it('should transform string "false" to boolean false', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { is_read: 'false' });

      expect(dto.is_read).toBe(false);
    });

    it('should return undefined for boolean true (transform expects string)', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { is_read: true });

      // Transform only handles string 'true'/'false', returns undefined otherwise
      expect(dto.is_read).toBeUndefined();
    });

    it('should return undefined for boolean false (transform expects string)', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { is_read: false });

      expect(dto.is_read).toBeUndefined();
    });

    it('should keep undefined as undefined (transform not applied)', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, {});

      expect(dto.is_read).toBeUndefined();
    });
  });

  describe('inherited pagination fields', () => {
    it('should transform page string to number', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { page: '2' });

      expect(dto.page).toBe(2);
    });

    it('should transform per_page string to number', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { per_page: '20' });

      expect(dto.per_page).toBe(20);
    });

    it('should validate page is positive integer', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { page: -1 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate per_page is between 1 and 100', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, { per_page: 101 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid pagination params', async () => {
      const dto = plainToClass(FindAllContactsQueryDto, {
        page: 5,
        per_page: 25,
        search: 'test',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
