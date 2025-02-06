import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createProjectDto: CreateProjectDto = { title: 'Test Project', description: 'Test Description', shortDescription: 'Short Description', repoUrl: 'url' };
      const result: Project = { id: 1, ...createProjectDto, liveUrl: null, isFeatured: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      jest.spyOn(service, 'create').mockImplementation(async () => result);

      expect(await controller.create(createProjectDto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const result = {
        data: [
          { id: 1, title: 'Test Project', description: 'Test Description', shortDescription: 'Short Description', repoUrl: 'url', liveUrl: null, isFeatured: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        ],
        total: 1,
      };

      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll('1', '10')).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const result: Project = { id: 1, title: 'Test Project', description: 'Test Description', shortDescription: 'Short Description', repoUrl: 'url', liveUrl: null, isFeatured: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      jest.spyOn(service, 'findOne').mockImplementation(async () => result);

      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateProjectDto: UpdateProjectDto = { title: 'Updated Title', description: 'Updated Description' };
      const result: Project = { id: 1, title: 'New Title', description: 'New Description',  ...updateProjectDto, shortDescription: 'Short Description', repoUrl: 'url', liveUrl: null, isFeatured: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      jest.spyOn(service, 'update').mockImplementation(async () => result);

      expect(await controller.update('1', updateProjectDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined);

      expect(await controller.remove('1')).toBeUndefined();
    });
  });
});