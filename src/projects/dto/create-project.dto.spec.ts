import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from '@projects/types/project-status';

describe('CreateProjectDto', () => {
  describe('validation', () => {
    it('should validate valid full input', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/user/repo',
        isFeatured: true,
        techStack: ['React', 'Node.js'],
        content: 'Detailed project content',
        heroImage: 'https://example.com/image.jpg',
        features: ['Feature 1', 'Feature 2'],
        status: ProjectStatus.COMPLETED,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate valid minimal input (required fields only)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing required title', async () => {
      const dto = plainToClass(CreateProjectDto, {
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should reject missing required description', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('should reject missing required shortDescription', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'shortDescription')).toBe(true);
    });

    it('should reject missing required repoUrl', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'repoUrl')).toBe(true);
    });

    it('should reject invalid repoUrl (not a URL)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'repoUrl')).toBe(true);
    });

    it('should reject repoUrl without protocol', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'repoUrl')).toBe(true);
    });

    it('should accept optional liveUrl with valid URL', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject optional liveUrl with invalid URL', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        liveUrl: 'not-a-url',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'liveUrl')).toBe(true);
    });

    it('should accept optional liveUrl without value (undefined)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.liveUrl).toBeUndefined();
    });

    it('should reject status with invalid enum value', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        status: 'InvalidStatus',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should accept status with valid enum values', async () => {
      for (const status of Object.values(ProjectStatus)) {
        const dto = plainToClass(CreateProjectDto, {
          title: 'My Project',
          description: 'A great project description',
          shortDescription: 'Short desc',
          repoUrl: 'https://github.com/user/repo',
          status,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should accept optional isFeatured as boolean', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        isFeatured: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.isFeatured).toBe(true);
    });

    it('should accept techStack as array of strings', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        techStack: ['React', 'Node.js', 'TypeScript'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(Array.isArray(dto.techStack)).toBe(true);
      expect(dto.techStack).toHaveLength(3);
    });

    it('should reject techStack with non-string elements', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        techStack: ['React', 123],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'techStack')).toBe(true);
    });

    it('should accept optional content as string', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        content: 'Long form content about the project',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept optional heroImage with valid URL', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        heroImage: 'https://example.com/hero.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject optional heroImage with invalid URL', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        heroImage: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'heroImage')).toBe(true);
    });

    it('should accept optional features as array of strings', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(Array.isArray(dto.features)).toBe(true);
      expect(dto.features).toHaveLength(3);
    });

    it('should reject features with non-string elements', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        features: ['Feature 1', 456],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'features')).toBe(true);
    });

    it('should enforce maxLength on title (200)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'a'.repeat(201),
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should accept title at maxLength boundary (200)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'a'.repeat(200),
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should enforce maxLength on description (1000)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'a'.repeat(1001),
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('should enforce maxLength on shortDescription (500)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'a'.repeat(501),
        repoUrl: 'https://github.com/user/repo',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'shortDescription')).toBe(true);
    });

    it('should enforce maxLength on techStack items (50)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        techStack: ['a'.repeat(51)],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'techStack')).toBe(true);
    });

    it('should enforce maxLength on features items (100)', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'My Project',
        description: 'A great project description',
        shortDescription: 'Short desc',
        repoUrl: 'https://github.com/user/repo',
        features: ['a'.repeat(101)],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'features')).toBe(true);
    });
  });
});
