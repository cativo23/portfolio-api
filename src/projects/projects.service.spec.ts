import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;

  beforeEach(async () => {
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
    it('should create a new project', async () => {
      const createProjectDto: CreateProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        shortDescription: 'Short Description',
        repoUrl: 'url',
      };
      const project = { id: 1, ...createProjectDto };

      jest.spyOn(repository, 'create').mockReturnValue(project as any);
      jest.spyOn(repository, 'save').mockResolvedValue(project as any);

      expect(await service.create(createProjectDto)).toEqual(project);
    });
  });

  describe('findAll', () => {
    it('should return an array of projects and total count', async () => {
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
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
          }) as any,
      );

      expect(await service.findAll(options)).toEqual({ data: projects, total });
    });
  });

  describe('findOne', () => {
    it('should return a project', async () => {
      const project = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(project as any);

      expect(await service.findOne(1)).toEqual(project);
    });

    it('should throw NotFoundException if project not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Project',
        description: 'Updated Description',
      };
      const project = { id: 1, ...updateProjectDto };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(project as any);

      expect(await service.update(1, updateProjectDto)).toEqual(project);
    });

    it('should throw NotFoundException if project not found', async () => {
      const updateProjectDto: UpdateProjectDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.update(1, updateProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.toBeTruthy();
    });

    it('should throw NotFoundException if project not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
