import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponseDto,
  ProjectsListResponseDto,
  SingleProjectResponseDto,
  DeleteResponseDto,
} from './dto';
import { InternalServerException } from '@core/exceptions/internal-server.exception';
import { NotFoundException } from '@core/exceptions/not-found.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProject: Project = {
    id: 1,
    title: 'Test Project',
    description: 'Test Description',
    shortDescription: 'Short Description',
    repoUrl: 'url',
    liveUrl: null,
    isFeatured: false,
    techStack: ['NestJS', 'TypeORM'],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    deletedAt: null,
  };

  const mockProjectResponseDto = ProjectResponseDto.fromEntity(mockProject);

  const mockSingleProjectResponseDto =
    SingleProjectResponseDto.fromEntity(mockProject);

  const mockProjectsListResponseDto = ProjectsListResponseDto.fromEntities(
    [mockProjectResponseDto],
    1,
    10,
    1,
  );

  const mockDeleteResponseDto = DeleteResponseDto.withMessage(
    'Project successfully deleted',
  );

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockService },
        {
          provide: getRepositoryToken(Project),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => ({ JWT_SECRET: 'test-secret' })[key]),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project and return it', async () => {
      const dto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
      };

      mockService.create.mockResolvedValue(mockProject);

      const result = await controller.create(dto);

      expect(result).toEqual(mockSingleProjectResponseDto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should throw if service throws', async () => {
      const dto: CreateProjectDto = {
        title: 'Fail',
        description: 'Fail',
        shortDescription: 'Fail',
        repoUrl: 'fail',
      };

      mockService.create.mockRejectedValue(new Error('Error creating'));

      await expect(controller.create(dto)).rejects.toThrow('Error creating');
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of projects', async () => {
      mockService.findAll.mockResolvedValue({
        items: [mockProject],
        total: 1,
        page: 1,
        per_page: 10,
      });

      const response = await controller.findAll('1', '10');
      expect(response).toEqual(mockProjectsListResponseDto);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        search: undefined,
        isFeatured: undefined,
      });
    });

    it('should throw if service fails', async () => {
      mockService.findAll.mockRejectedValue(new Error('Find error'));
      await expect(controller.findAll('1', '10')).rejects.toThrow('Find error');
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      mockService.findOne.mockResolvedValue(mockProject);
      const result = await controller.findOne('1');

      expect(result).toEqual(mockSingleProjectResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('2')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update and return the project', async () => {
      const dto: UpdateProjectDto = {
        title: 'Updated',
        description: 'Updated',
      };

      // Create a new mock entity with updated data
      const updatedProject = { ...mockProject, ...dto };
      const updatedResponseDto =
        SingleProjectResponseDto.fromEntity(updatedProject);
      mockService.update.mockResolvedValue(updatedProject);

      const result = await controller.update('1', dto);

      expect(result).toEqual(updatedResponseDto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw if update fails', async () => {
      mockService.update.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update('1', { title: 'fail' })).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('remove', () => {
    it('should return success message on deletion', async () => {
      mockService.remove.mockResolvedValue(mockDeleteResponseDto);

      const result = await controller.remove('1');

      expect(result).toBe(mockDeleteResponseDto);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw if deletion fails', async () => {
      mockService.remove.mockRejectedValue(
        new InternalServerException('Cannot delete'),
      );

      await expect(controller.remove('99')).rejects.toThrow('Cannot delete');
    });
  });
});
