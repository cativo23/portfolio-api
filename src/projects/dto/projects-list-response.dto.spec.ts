import { ProjectsListResponseDto } from './projects-list-response.dto';
import { ProjectResponseDto } from './project-response.dto';
import { ProjectStatus } from '@projects/types/project-status';

describe('ProjectsListResponseDto', () => {
  describe('fromEntities', () => {
    it('should create instance with correct data and pagination meta', () => {
      const mockProjects: ProjectResponseDto[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          shortDescription: 'Short 1',
          repoUrl: 'https://github.com/user/repo1',
          isFeatured: true,
          techStack: ['React'],
          features: ['Feature 1'],
          status: ProjectStatus.COMPLETED,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 2,
          title: 'Project 2',
          description: 'Description 2',
          shortDescription: 'Short 2',
          repoUrl: 'https://github.com/user/repo2',
          isFeatured: false,
          techStack: ['Vue.js'],
          features: ['Feature 2'],
          status: ProjectStatus.IN_PROGRESS,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
        },
      ];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        25,
      );

      expect(response).toBeInstanceOf(ProjectsListResponseDto);
      expect(response.data).toEqual(mockProjects);
      expect(response.data).toHaveLength(2);
      expect(response.status).toBe('success');
    });

    it('should calculate total_pages correctly', () => {
      const mockProjects: ProjectResponseDto[] = [];

      // Total 50 items, 10 per page = 5 pages
      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        50,
      );

      expect(response.meta.pagination.total_pages).toBe(5);
    });

    it('should round up total_pages for fractional pages', () => {
      const mockProjects: ProjectResponseDto[] = [];

      // Total 45 items, 10 per page = 4.5 pages, should round to 5
      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        45,
      );

      expect(response.meta.pagination.total_pages).toBe(5);
    });

    it('should set correct pagination page', () => {
      const mockProjects: ProjectResponseDto[] = [];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        3,
        15,
        100,
      );

      expect(response.meta.pagination.page).toBe(3);
    });

    it('should set correct pagination limit', () => {
      const mockProjects: ProjectResponseDto[] = [];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        2,
        20,
        100,
      );

      expect(response.meta.pagination.limit).toBe(20);
    });

    it('should set correct total_items', () => {
      const mockProjects: ProjectResponseDto[] = [];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        123,
      );

      expect(response.meta.pagination.total_items).toBe(123);
    });

    it('should handle single page of results', () => {
      const mockProjects: ProjectResponseDto[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          shortDescription: 'Short 1',
          repoUrl: 'https://github.com/user/repo1',
          isFeatured: true,
          techStack: ['React'],
          features: ['Feature 1'],
          status: ProjectStatus.COMPLETED,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        5,
      );

      expect(response.meta.pagination.total_pages).toBe(1);
      expect(response.meta.pagination.page).toBe(1);
    });

    it('should handle empty results', () => {
      const mockProjects: ProjectResponseDto[] = [];

      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        1,
        10,
        0,
      );

      expect(response.data).toEqual([]);
      expect(response.meta.pagination.total_items).toBe(0);
      expect(response.meta.pagination.total_pages).toBe(0);
    });

    it('should handle last page with partial results', () => {
      const mockProjects: ProjectResponseDto[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          shortDescription: 'Short 1',
          repoUrl: 'https://github.com/user/repo1',
          isFeatured: true,
          techStack: ['React'],
          features: ['Feature 1'],
          status: ProjectStatus.COMPLETED,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 2,
          title: 'Project 2',
          description: 'Description 2',
          shortDescription: 'Short 2',
          repoUrl: 'https://github.com/user/repo2',
          isFeatured: false,
          techStack: ['Vue.js'],
          features: ['Feature 2'],
          status: ProjectStatus.IN_PROGRESS,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
        },
      ];

      // Page 3, limit 10, total 25 items
      const response = ProjectsListResponseDto.fromEntities(
        mockProjects,
        3,
        10,
        25,
      );

      expect(response.meta.pagination.page).toBe(3);
      expect(response.meta.pagination.total_pages).toBe(3);
      expect(response.data).toHaveLength(2);
    });
  });

  describe('constructor', () => {
    it('should set data correctly', () => {
      const mockProjects: ProjectResponseDto[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          shortDescription: 'Short 1',
          repoUrl: 'https://github.com/user/repo1',
          isFeatured: true,
          techStack: ['React'],
          features: ['Feature 1'],
          status: ProjectStatus.COMPLETED,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      const meta = {
        pagination: {
          page: 1,
          limit: 10,
          total_items: 1,
          total_pages: 1,
        },
      };

      const response = new ProjectsListResponseDto(mockProjects, meta);

      expect(response.data).toEqual(mockProjects);
    });

    it('should set meta correctly', () => {
      const mockProjects: ProjectResponseDto[] = [];

      const meta = {
        pagination: {
          page: 2,
          limit: 15,
          total_items: 50,
          total_pages: 4,
        },
      };

      const response = new ProjectsListResponseDto(mockProjects, meta);

      expect(response.meta).toEqual(meta);
      expect(response.meta.pagination.page).toBe(2);
      expect(response.meta.pagination.limit).toBe(15);
      expect(response.meta.pagination.total_items).toBe(50);
      expect(response.meta.pagination.total_pages).toBe(4);
    });

    it('should set status to success', () => {
      const response = new ProjectsListResponseDto([], {
        pagination: {
          page: 1,
          limit: 10,
          total_items: 0,
          total_pages: 0,
        },
      });

      expect(response.status).toBe('success');
    });
  });
});
