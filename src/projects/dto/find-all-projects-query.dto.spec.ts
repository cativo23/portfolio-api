import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { FindAllProjectsQueryDto } from './find-all-projects-query.dto';

describe('FindAllProjectsQueryDto', () => {
  describe('is_featured transformation', () => {
    it('should transform string "true" to boolean true', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, {
        is_featured: 'true',
      });

      expect(dto.is_featured).toBe(true);
    });

    it('should transform string "false" to boolean false', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, {
        is_featured: 'false',
      });

      expect(dto.is_featured).toBe(false);
    });

    it('should return undefined for boolean true (transform expects string)', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { is_featured: true });

      // Transform only handles string 'true'/'false', returns undefined otherwise
      expect(dto.is_featured).toBeUndefined();
    });

    it('should return undefined for boolean false (transform expects string)', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { is_featured: false });

      expect(dto.is_featured).toBeUndefined();
    });

    it('should keep undefined as undefined (transform not applied)', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, {});

      expect(dto.is_featured).toBeUndefined();
    });
  });

  describe('inherited pagination fields', () => {
    it('should transform page string to number', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { page: '2' });

      expect(dto.page).toBe(2);
    });

    it('should transform per_page string to number', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { per_page: '20' });

      expect(dto.per_page).toBe(20);
    });

    it('should validate page is positive integer', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { page: -1 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate per_page is between 1 and 100', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, { per_page: 101 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid pagination params', async () => {
      const dto = plainToClass(FindAllProjectsQueryDto, {
        page: 5,
        per_page: 25,
        search: 'test',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
