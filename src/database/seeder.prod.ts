import AppDataSource from '@config/typeorm.config.prod';
import { User } from '@users/entities/user.entity';
import { Project } from '@projects/entities/project.entity';
import { Contact } from '@contacts/entities/contact.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    const dataSource = await AppDataSource.initialize();

    const userRepo = dataSource.getRepository(User);
    const projectRepo = dataSource.getRepository(Project);
    const contactRepo = dataSource.getRepository(Contact);

    // Clear existing test data (use with care)
    await contactRepo.clear();
    await projectRepo.clear();
    await userRepo.clear();

    // Users
    const password = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD, 10);
    const users = [
      userRepo.create({
        username: 'admin',
        email: 'cativo23.kt@gmail.com',
        password,
      }),
    ];
    await userRepo.save(users);

    // Projects
    const projects = [
      projectRepo.create({
        title: 'Portfolio Website',
        description: 'Portfolio website built with Nuxt.js and Tailwind CSS',
        shortDescription: 'Personal portfolio site',
        liveUrl: 'https://cativo.dev',
        repoUrl: 'https://github.com/cativo23/portfolio',
        isFeatured: true,
        techStack: ['Nuxt.js', 'Tailwind CSS', 'Vue.js', 'TypeScript'],
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
        status: 'Completed',
      }),
      projectRepo.create({
        title: 'Portfolio API',
        description: 'Portfolio API built with NestJS and TypeORM',
        shortDescription: 'Backend API for portfolio website',
        liveUrl: 'https://api.cativo.dev',
        repoUrl: 'https://github.com/cativo23/portfolio-api',
        isFeatured: true,
        techStack: [
          'NestJS',
          'TypeORM',
          'MySQL',
          'TypeScript',
          'Docker',
          'JWT',
        ],
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
        status: 'Maintained',
      }),
      projectRepo.create({
        title: 'Myths and Legends from El Salvador API',
        description:
          'An API providing information about myths and legends from El Salvador using python and FastAPI',
        shortDescription: 'API for myths and legends',
        liveUrl: '',
        repoUrl: 'https://github.com/cativo23/myths-and-legends-api',
        isFeatured: false,
        techStack: ['Python', 'FastAPI', 'PostgreSQL'],
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
        status: 'Completed',
      }),
      projectRepo.create({
        title: 'Tacoview',
        description:
          'Tacoview is an event-driven restaurant review platform built with Vue, NestJS, Apache Kafka, and PostgreSQL, designed to demonstrate scalable microservices, eventual consistency, and real-world backend architecture.',
        shortDescription: 'Restaurant review platform',
        liveUrl: 'https://tacoview.example.com',
        repoUrl: 'https://github.com/cativo23/tacoview',
        isFeatured: false,
        techStack: ['Vue.js', 'NestJS', 'Apache Kafka', 'PostgreSQL'],
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
        status: 'In Progress',
      }),
    ];
    await projectRepo.save(projects);

    // Contacts
    const contacts = [
      contactRepo.create({
        name: 'Jane Developer',
        email: 'jane@example.com',
        message: 'Hello — I like your work!',
        subject: 'Collaboration',
        isRead: false,
      }),
      contactRepo.create({
        name: 'John Tester',
        email: 'john@example.com',
        message: 'Just testing the contact form',
        isRead: false,
      }),
    ];
    await contactRepo.save(contacts);

    console.log('Seeding complete');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
