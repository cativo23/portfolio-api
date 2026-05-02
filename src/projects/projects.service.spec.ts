import { vi, type SpyInstance } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from '@projects/dto';
import { UpdateProjectDto } from '@projects/dto';
import { NotFoundException, Logger } from '@nestjs/common';
import { SuccessResponseDto } from '@core/dto';
import { CacheInvalidationService } from '@src/cache/cache-invalidation.service';
import { ProjectStatus } from './types/project-status';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;
  // Logger spy variables
  let cacheInvalidationService: CacheInvalidationService;
  let logSpy: SpyInstance;
  let warnSpy: SpyInstance;

  beforeEach(async () => {
    // Mock Logger methods
    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(vi.fn());
    warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(vi.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useClass: Repository,
        },
        {
          provide: CacheInvalidationService,
          useValue: {
            invalidateByPrefix: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
    cacheInvalidationService = module.get<CacheInvalidationService>(
      CacheInvalidationService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project and return Project entity', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: 'Project content',
        heroImage: 'https://example.com/hero.png',
        features: ['Feature 1', 'Feature 2'],
        status: ProjectStatus.COMPLETED,
      };
      const project = { id: 1, ...createProjectDto };

      vi.spyOn(repository, 'create').mockReturnValue(project as any);
      vi.spyOn(repository, 'save').mockResolvedValue(project as any);

      const result = await service.create(createProjectDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: project.id,
          title: project.title,
          description: project.description,
          content: project.content,
          heroImage: project.heroImage,
          features: project.features,
          status: project.status,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Project created with ID ${project.id}`,
      );
    });

    it('should invalidate cache after creating a project', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: 'Project content',
        heroImage: 'https://example.com/hero.png',
        features: ['Feature 1', 'Feature 2'],
        status: ProjectStatus.COMPLETED,
      };
      const project = { id: 1, ...createProjectDto };

      vi.spyOn(repository, 'create').mockReturnValue(project as any);
      vi.spyOn(repository, 'save').mockResolvedValue(project as any);

      await service.create(createProjectDto);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith(
        'projects',
      );
    });

    it('should let errors bubble up when repository.save throws an error', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: 'Project content',
        heroImage: 'https://example.com/hero.png',
        features: ['Feature 1', 'Feature 2'],
        status: ProjectStatus.COMPLETED,
      };
      const project = { id: 1, ...createProjectDto };
      const error = new Error('Database error');

      vi.spyOn(repository, 'create').mockReturnValue(project as any);
      vi.spyOn(repository, 'save').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.create(createProjectDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return projects with pagination metadata', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: '',
        isFeatured: undefined,
      };
      const projects = [
        { id: 1, title: 'Test Project', description: 'Test Description' },
      ];
      const total = 1;

      vi.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValue([projects, total]),
          }) as any,
      );

      const result = await service.findAll(options);

      expect(result.items).toEqual(projects);
      expect(result.total).toBe(total);
      expect(result.page).toBe(options.page);
      expect(result.per_page).toBe(options.per_page);
      expect(logSpy).toHaveBeenCalledWith(`Found ${total} projects`);
    });

    it('should apply search filter when search is provided', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: 'test',
        isFeatured: undefined,
      };
      const projects = [
        { id: 1, title: 'Test Project', description: 'Test Description' },
      ];
      const total = 1;
      const andWhereMock = vi.fn().mockReturnThis();

      vi.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValue([projects, total]),
          }) as any,
      );

      await service.findAll(options);

      expect(andWhereMock).toHaveBeenCalledWith(
        '(projects.title LIKE :search OR projects.description LIKE :search)',
        { search: '%test%' },
      );
    });

    it('should apply isFeatured filter when isFeatured is provided', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: '',
        isFeatured: true,
      };
      const projects = [
        {
          id: 1,
          title: 'Test Project',
          description: 'Test Description',
          isFeatured: true,
        },
      ];
      const total = 1;
      const andWhereMock = vi.fn().mockReturnThis();

      vi.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValue([projects, total]),
          }) as any,
      );

      await service.findAll(options);

      expect(andWhereMock).toHaveBeenCalledWith(
        'projects.isFeatured = :isFeatured',
        { isFeatured: true },
      );
    });

    it('should let errors bubble up when query fails', async () => {
      const options = {
        page: 1,
        per_page: 10,
        search: '',
        isFeatured: undefined,
      };
      const error = new Error('Database error');

      vi.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockRejectedValue(error),
          }) as any,
      );

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.findAll(options)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return Project entity', async () => {
      const project = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: 'Project content',
        heroImage: 'https://example.com/hero.png',
        features: ['Feature 1'],
        status: ProjectStatus.COMPLETED,
      };

      vi.spyOn(repository, 'findOne').mockResolvedValue(project as any);

      const result = await service.findOne(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: project.id,
          title: project.title,
          description: project.description,
          content: project.content,
          heroImage: project.heroImage,
          features: project.features,
          status: project.status,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Found project with ID 1`);
    });

    it('should throw NotFoundException if project not found', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
    });

    it('should let errors bubble up when repository.findOne throws an error', async () => {
      const error = new Error('Database error');
      error.stack = 'Error stack';

      vi.spyOn(repository, 'findOne').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.findOne(1)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      vi.spyOn(repository, 'findOne').mockRejectedValue(error);

      // NotFoundException should bubble up naturally
      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a project and return Project entity', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated Description',
        content: 'Updated content',
        heroImage: 'https://example.com/new-hero.png',
        features: ['New Feature'],
        status: ProjectStatus.IN_PROGRESS,
      };
      const existingProject = {
        id: 1,
        title: 'Original Project',
        description: 'Original Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: 'Original content',
        heroImage: 'https://example.com/old-hero.png',
        features: ['Old Feature'],
        status: ProjectStatus.COMPLETED,
      };
      const updatedProject = {
        id: 1,
        ...existingProject,
        ...updateProjectDto,
      };

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      vi.spyOn(repository, 'merge').mockReturnValue(updatedProject as any);
      vi.spyOn(repository, 'save').mockResolvedValue(updatedProject as any);

      const result = await service.update(1, updateProjectDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: updatedProject.id,
          title: updatedProject.title,
          description: updatedProject.description,
          content: updatedProject.content,
          heroImage: updatedProject.heroImage,
          features: updatedProject.features,
          status: updatedProject.status,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Updated project with ID 1`);
    });

    it('should invalidate cache after updating a project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated Description',
        content: 'Updated content',
        heroImage: 'https://example.com/new-hero.png',
        features: ['New Feature'],
        status: ProjectStatus.IN_PROGRESS,
      };
      const existingProject = {
        id: 1,
        title: 'Original',
        description: 'Original',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: null,
        heroImage: null,
        features: [],
        status: ProjectStatus.COMPLETED,
      };
      const updatedProject = { id: 1, ...updateProjectDto };

      vi.spyOn(repository, 'findOne').mockResolvedValueOnce(
        existingProject as any,
      );
      vi.spyOn(repository, 'merge').mockReturnValue(updatedProject as any);
      vi.spyOn(repository, 'save').mockResolvedValue(updatedProject as any);

      await service.update(1, updateProjectDto);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith(
        'projects',
      );
    });

    it('should throw NotFoundException if project not found during initial check', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      vi.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      const mergeSpy = vi.spyOn(repository, 'merge');
      const saveSpy = vi.spyOn(repository, 'save');

      await expect(service.update(1, updateProjectDto)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
      expect(mergeSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should let errors bubble up when repository.save throws an error', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const existingProject = {
        id: 1,
        title: 'Original Project',
        description: 'Original Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
        content: null,
        heroImage: null,
        features: [],
        status: ProjectStatus.COMPLETED,
      };
      const error = new Error('Database error');
      error.stack = 'Error stack';

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      vi.spyOn(repository, 'merge').mockReturnValue(existingProject as any);
      vi.spyOn(repository, 'save').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.update(1, updateProjectDto)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const error = new NotFoundException(`Project with ID 1 not found`);

      vi.spyOn(repository, 'findOne').mockRejectedValue(error);

      // NotFoundException should bubble up naturally
      await expect(service.update(1, updateProjectDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a project and return DeleteResponseDto', async () => {
      const existingProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      vi.spyOn(repository, 'softRemove').mockResolvedValue(
        existingProject as any,
      );

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data.message).toBe('Project successfully deleted');
      expect(logSpy).toHaveBeenCalledWith(`Soft-deleted project with ID 1`);
    });

    it('should invalidate cache after removing a project', async () => {
      const existingProject = { id: 1, title: 'Test', description: 'Test' };

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      vi.spyOn(repository, 'softRemove').mockResolvedValue(
        existingProject as any,
      );

      await service.remove(1);

      expect(cacheInvalidationService.invalidateByPrefix).toHaveBeenCalledWith(
        'projects',
      );
    });

    it('should throw NotFoundException if project not found during initial check', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      const softRemoveSpy = vi.spyOn(repository, 'softRemove');

      await expect(service.remove(1)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
      expect(softRemoveSpy).not.toHaveBeenCalled();
    });

    it('should let errors bubble up when repository.softRemove throws an error', async () => {
      const existingProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };
      const error = new Error('Database error');
      error.stack = 'Error stack';

      vi.spyOn(repository, 'findOne').mockResolvedValue(existingProject as any);
      vi.spyOn(repository, 'softRemove').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.remove(1)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      vi.spyOn(repository, 'findOne').mockRejectedValue(error);

      // NotFoundException should bubble up naturally
      await expect(service.remove(1)).rejects.toThrow(error);
    });
  });
});
