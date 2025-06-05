import { DataSource } from 'typeorm';
import { BaseSeeder } from './base.seeder';
import { Project } from '@projects/entities/project.entity';

/**
 * Seeder for the Project entity
 * Creates test projects in the database
 */
export class ProjectSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  /**
   * Seeds the database with test projects
   */
  public async seed(): Promise<void> {
    // Clear existing projects
    await this.clear('projects');

    const projectRepository = this.dataSource.getRepository(Project);

    // Create test projects
    const projects = [
      {
        title: 'Portfolio Website',
        description:
          'A personal portfolio website built with React and TypeScript.',
        shortDescription: 'Personal portfolio website',
        liveUrl: 'https://portfolio.example.com',
        repoUrl: 'https://github.com/example/portfolio',
        isFeatured: true,
      },
      {
        title: 'E-commerce Platform',
        description:
          'A full-stack e-commerce platform built with Node.js, Express, and MongoDB.',
        shortDescription: 'Full-stack e-commerce platform',
        liveUrl: 'https://shop.example.com',
        repoUrl: 'https://github.com/example/ecommerce',
        isFeatured: true,
      },
      {
        title: 'Weather App',
        description:
          'A weather application that uses the OpenWeatherMap API to display current weather conditions.',
        shortDescription: 'Weather application',
        liveUrl: 'https://weather.example.com',
        repoUrl: 'https://github.com/example/weather-app',
        isFeatured: false,
      },
      {
        title: 'Task Manager',
        description:
          'A task management application built with React and Firebase.',
        shortDescription: 'Task management application',
        liveUrl: 'https://tasks.example.com',
        repoUrl: 'https://github.com/example/task-manager',
        isFeatured: false,
      },
      {
        title: 'Blog Platform',
        description: 'A blogging platform built with Next.js and Strapi.',
        shortDescription: 'Blogging platform',
        liveUrl: 'https://blog.example.com',
        repoUrl: 'https://github.com/example/blog-platform',
        isFeatured: false,
      },
    ];

    // Save projects to database
    for (const projectData of projects) {
      const project = projectRepository.create(projectData);
      await projectRepository.save(project);
      this.logger.log(`Created project: ${project.title}`);
    }
  }
}
