import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  describe('page field', () => {
    it('should transform string "1" to number 1', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: '1' });

      expect(dto.page).toBe(1);
    });

    it('should transform string "10" to number 10', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: '10' });

      expect(dto.page).toBe(10);
    });

    it('should keep number as number', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: 5 });

      expect(dto.page).toBe(5);
    });

    it('should default to 1 when not provided', async () => {
      const dto = plainToClass(PaginationQueryDto, {});

      expect(dto.page).toBe(1);
    });

    it('should validate page is an integer', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: 1.5 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate page is at least 1', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate page is not negative', async () => {
      const dto = plainToClass(PaginationQueryDto, { page: -5 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('per_page field', () => {
    it('should transform string "10" to number 10', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: '10' });

      expect(dto.per_page).toBe(10);
    });

    it('should transform string "50" to number 50', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: '50' });

      expect(dto.per_page).toBe(50);
    });

    it('should keep number as number', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 25 });

      expect(dto.per_page).toBe(25);
    });

    it('should default to 10 when not provided', async () => {
      const dto = plainToClass(PaginationQueryDto, {});

      expect(dto.per_page).toBe(10);
    });

    it('should validate per_page is an integer', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 10.5 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate per_page is at least 1', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate per_page is at most 100', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 101 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept per_page of 1', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 1 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept per_page of 100', async () => {
      const dto = plainToClass(PaginationQueryDto, { per_page: 100 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('search field', () => {
    it('should accept string search term', async () => {
      const dto = plainToClass(PaginationQueryDto, { search: 'test' });

      expect(dto.search).toBe('test');
    });

    it('should accept empty string search term', async () => {
      const dto = plainToClass(PaginationQueryDto, { search: '' });

      expect(dto.search).toBe('');
    });

    it('should be optional when not provided', async () => {
      const dto = plainToClass(PaginationQueryDto, {});

      expect(dto.search).toBeUndefined();
    });

    it('should validate search is a string', async () => {
      const dto = plainToClass(PaginationQueryDto, { search: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should accept all valid fields together', async () => {
      const dto = plainToClass(PaginationQueryDto, {
        page: 5,
        per_page: 20,
        search: 'project',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should have errors only for invalid fields', async () => {
      const dto = plainToClass(PaginationQueryDto, {
        page: -1,
        per_page: 50,
        search: 'valid',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('page');
    });
  });
});
