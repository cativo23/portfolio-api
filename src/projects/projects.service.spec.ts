import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from '@projects/dto';
import { UpdateProjectDto } from '@projects/dto';
import { NotFoundException, Logger } from '@nestjs/common';
import { SuccessResponseDto } from '@core/dto';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;
  // Logger spy variables
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Mock Logger methods
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(jest.fn());
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
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
      };
      const project = { id: 1, ...createProjectDto };

      jest.spyOn(repository, 'create').mockReturnValue(project as any);
      jest.spyOn(repository, 'save').mockResolvedValue(project as any);

      const result = await service.create(createProjectDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: project.id,
          title: project.title,
          description: project.description,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Project created with ID ${project.id}`,
      );
    });

    it('should let errors bubble up when repository.save throws an error', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
      };
      const project = { id: 1, ...createProjectDto };
      const error = new Error('Database error');

      jest.spyOn(repository, 'create').mockReturnValue(project as any);
      jest.spyOn(repository, 'save').mockRejectedValue(error);

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

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
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
      const andWhereMock = jest.fn().mockReturnThis();

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
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
      const andWhereMock = jest.fn().mockReturnThis();

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: andWhereMock,
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
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

      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockRejectedValue(error),
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
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(project as any);

      const result = await service.findOne(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: project.id,
          title: project.title,
          description: project.description,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Found project with ID 1`);
    });

    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
    });

    it('should let errors bubble up when repository.findOne throws an error', async () => {
      const error = new Error('Database error');
      error.stack = 'Error stack';

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.findOne(1)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      // NotFoundException should bubble up naturally
      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a project and return Project entity', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated Description',
      };
      const existingProject = {
        id: 1,
        title: 'Original Project',
        description: 'Original Description',
      };
      const updatedProject = {
        id: 1,
        ...existingProject,
        ...updateProjectDto,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingProject as any);
      jest.spyOn(repository, 'merge').mockReturnValue(updatedProject as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedProject as any);

      const result = await service.update(1, updateProjectDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: updatedProject.id,
          title: updatedProject.title,
          description: updatedProject.description,
        }),
      );
      expect(logSpy).toHaveBeenCalledWith(`Updated project with ID 1`);
    });

    it('should throw NotFoundException if project not found during initial check', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      const mergeSpy = jest.spyOn(repository, 'merge');
      const saveSpy = jest.spyOn(repository, 'save');

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
      };
      const error = new Error('Database error');
      error.stack = 'Error stack';

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingProject as any);
      jest.spyOn(repository, 'merge').mockReturnValue(existingProject as any);
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.update(1, updateProjectDto)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

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

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingProject as any);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data.message).toBe('Project successfully deleted');
      expect(logSpy).toHaveBeenCalledWith(`Deleted project with ID 1`);
    });

    it('should throw NotFoundException if project not found during initial check', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      const deleteSpy = jest.spyOn(repository, 'delete');

      await expect(service.remove(1)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete operation fails (no rows affected)', async () => {
      const existingProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingProject as any);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      // If no rows affected, treat as not found
      await expect(service.remove(1)).rejects.toThrow(
        'Project with ID 1 not found',
      );
      expect(warnSpy).toHaveBeenCalledWith(
        `Failed to delete project with ID 1 - no rows affected`,
      );
    });

    it('should let errors bubble up when repository.delete throws an error', async () => {
      const existingProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };
      const error = new Error('Database error');
      error.stack = 'Error stack';

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(existingProject as any);
      jest.spyOn(repository, 'delete').mockRejectedValue(error);

      // Errors should bubble up naturally - let global exception filter handle them
      await expect(service.remove(1)).rejects.toThrow(error);
    });

    it('should let NotFoundException bubble up when repository.findOne throws it', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      // NotFoundException should bubble up naturally
      await expect(service.remove(1)).rejects.toThrow(error);
    });
  });
});
