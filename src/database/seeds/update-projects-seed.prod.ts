import AppDataSource from '@config/typeorm.config.prod';
import { Project } from '@projects/entities/project.entity';
import { ProjectStatus } from '@projects/types/project-status';

/**
 * Sample data to fill missing fields for existing projects
 */
const projectUpdates: Record<string, Partial<Project>> = {
  'Portfolio Website': {
    content: `# Portfolio Website

This is my personal portfolio website showcasing my work as a developer.

## Features

- Responsive design
- Dark mode support
- Project showcase
- Contact form

## Technologies

Built with Nuxt.js 3, Tailwind CSS, and deployed on Vercel.`,
    heroImage: 'https://cativo.dev/og-image.png',
    features: [
      'Responsive design',
      'Dark mode',
      'SEO optimized',
      'Fast performance',
    ],
    status: ProjectStatus.COMPLETED,
  },
  'Portfolio API': {
    content: `# Portfolio API

A RESTful API for managing portfolio projects and contacts.

## Architecture

- Clean architecture with separation of concerns
- JWT authentication
- Role-based access control
- Caching layer for performance

## Endpoints

- /projects - CRUD operations for projects
- /contacts - Contact form submissions
- /auth - Authentication endpoints`,
    heroImage: 'https://api.cativo.dev/architecture-diagram.png',
    features: [
      'JWT authentication',
      'Swagger documentation',
      'Automated testing',
      'Docker support',
    ],
    status: ProjectStatus.MAINTAINED,
  },
  'Blog Platform': {
    content: `# Blog Platform

A modern blogging platform with rich text editing capabilities.

## Features

- Markdown editor
- User authentication
- Comment system
- Tag management`,
    heroImage: 'https://blog.example.com/hero.png',
    features: ['Markdown support', 'User management', 'SEO friendly'],
    status: ProjectStatus.COMPLETED,
  },
  'E-commerce Store': {
    content: `# E-commerce Store

Full-featured e-commerce platform with payment processing.

## Features

- Product catalog
- Shopping cart
- Stripe payment integration
- Order management`,
    heroImage: 'https://store.example.com/hero.png',
    features: ['Payment integration', 'Inventory management', 'Order tracking'],
    status: ProjectStatus.IN_PROGRESS,
  },
  'Task Manager': {
    content: `# Task Manager

Real-time task management application with team collaboration features.

## Features

- Real-time sync
- Team collaboration
- Task priorities
- Due dates and reminders`,
    heroImage: 'https://tasks.example.com/hero.png',
    features: ['Real-time updates', 'Team collaboration', 'Mobile responsive'],
    status: ProjectStatus.COMPLETED,
  },
  'Social Media App': {
    content: `# Social Media App

A social networking platform with real-time messaging and content sharing.

## Features

- User profiles
- News feed
- Direct messaging
- Media sharing`,
    heroImage: 'https://social.example.com/hero.png',
    features: [
      'Real-time messaging',
      'Media uploads',
      'Friend system',
      'Notifications',
    ],
    status: ProjectStatus.IN_PROGRESS,
  },
  'Myths and Legends from El Salvador API': {
    content: `# Myths and Legends API

An API providing information about myths and legends from El Salvador.

## Features

- Comprehensive database of Salvadoran folklore
- Search and filter capabilities
- Cultural context and historical background`,
    heroImage: 'https://myths-and-legends.example.com/hero.png',
    features: [
      'Cultural preservation',
      'Search functionality',
      'Educational content',
    ],
    status: ProjectStatus.COMPLETED,
  },
  Tacoview: {
    content: `# Tacoview

Event-driven restaurant review platform demonstrating modern microservices architecture.

## Architecture

- Event-driven design with Apache Kafka
- Microservices communication
- Eventual consistency patterns
- Real-time data processing

## Features

- Restaurant reviews
- User ratings
- Real-time updates
- Scalable architecture`,
    heroImage: 'https://tacoview.example.com/architecture.png',
    features: [
      'Event-driven architecture',
      'Microservices',
      'Real-time processing',
      'Scalable design',
    ],
    status: ProjectStatus.IN_PROGRESS,
  },
};

async function updateProjects() {
  try {
    const dataSource = await AppDataSource.initialize();
    const projectRepo = dataSource.getRepository(Project);

    // Get all existing projects
    const projects = await projectRepo.find();
    console.log(`Found ${projects.length} projects`);

    let updatedCount = 0;

    for (const project of projects) {
      const updateData = projectUpdates[project.title];

      // Only update if the project has missing data (null or undefined)
      if (
        updateData &&
        (project.content == null ||
          project.heroImage == null ||
          project.features == null ||
          project.status == null)
      ) {
        await projectRepo.update(project.id, {
          content: project.content ?? updateData.content,
          heroImage: project.heroImage ?? updateData.heroImage,
          features: project.features ?? updateData.features,
          status: project.status ?? updateData.status,
        });
        updatedCount++;
        console.log(`Updated project: ${project.title}`);
      }
    }

    console.log(`\nUpdate complete: ${updatedCount} projects updated`);
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
}

updateProjects();
