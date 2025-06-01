import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundException, Logger } from '@nestjs/common';
import { InternalServerException } from '../core/exceptions';
import {
  SingleProjectResponseDto,
} from './dto';
import { SuccessResponseDto } from '../core/dto';

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
    it('should create a new project and return SingleProjectResponseDto', async () => {
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

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data).toEqual(
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

    it('should throw InternalServerException when repository.save throws an error', async () => {
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

      await expect(service.create(createProjectDto)).rejects.toThrow(
        InternalServerException,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        'Error creating project',
        error.stack,
      );
    });
  });

  describe('findAll', () => {
    it('should return ProjectsListResponseDto with projects and pagination', async () => {
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

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data.length).toBe(1);
      expect(result.meta.pagination).toEqual({
        page: options.page,
        limit: options.per_page,
        totalItems: total,
        totalPages: Math.ceil(total / options.per_page),
      });
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
        'projects.title LIKE :search OR projects.description LIKE :search',
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

    it('should throw InternalServerException when query fails', async () => {
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

      await expect(service.findAll(options)).rejects.toThrow(
        InternalServerException,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        'Error finding projects',
        error.stack,
      );
    });
  });

  describe('findOne', () => {
    it('should return SingleProjectResponseDto with project data', async () => {
      const project = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(project as any);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data).toEqual(
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

    it('should throw InternalServerException when repository.findOne throws an error', async () => {
      const error = new Error('Database error');
      error.stack = 'Error stack';

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(InternalServerException);
      expect(errorSpy).toHaveBeenCalledWith(
        `Error finding project with ID 1`,
        error.stack,
      );
    });

    it('should throw InternalServerException when NotFoundException is caught', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(
        `Error finding project with ID 1`,
      );
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a project and return SingleProjectResponseDto', async () => {
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
        ...updateProjectDto,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(existingProject as any) // First call for checking if project exists
        .mockResolvedValueOnce(updatedProject as any); // Second call for getting updated project
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, updateProjectDto);

      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data).toEqual(
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
      const updateSpy = jest.spyOn(repository, 'update');

      await expect(service.update(1, updateProjectDto)).rejects.toThrow(
        `Project with ID 1 not found`,
      );
      expect(warnSpy).toHaveBeenCalledWith(`Project with ID 1 not found`);
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should throw InternalServerException when repository.update throws an error', async () => {
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
      jest.spyOn(repository, 'update').mockRejectedValue(error);

      await expect(service.update(1, updateProjectDto)).rejects.toThrow(
        InternalServerException,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        `Error updating project with ID 1`,
        error.stack,
      );
    });

    it('should throw InternalServerException when NotFoundException is caught', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(service.update(1, updateProjectDto)).rejects.toThrow(
        `Error updating project with ID 1`,
      );
      expect(errorSpy).toHaveBeenCalled();
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

    it('should throw InternalServerException if delete operation fails', async () => {
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

      await expect(service.remove(1)).rejects.toThrow(InternalServerException);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to delete project with ID 1`,
      );
    });

    it('should throw InternalServerException when repository.delete throws an error', async () => {
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

      await expect(service.remove(1)).rejects.toThrow(InternalServerException);
      expect(errorSpy).toHaveBeenCalledWith(
        `Error deleting project with ID 1`,
        error.stack,
      );
    });

    it('should throw InternalServerException when NotFoundException is caught', async () => {
      const error = new NotFoundException(`Project with ID 1 not found`);

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(
        `Error deleting project with ID 1`,
      );
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
