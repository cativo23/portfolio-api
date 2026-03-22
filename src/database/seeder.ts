import AppDataSource from '@config/typeorm.config';
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
    const password = await bcrypt.hash('password123', 10);
    const users = [
      userRepo.create({
        username: 'testuser',
        email: 'test@example.com',
        password,
      }),
      userRepo.create({
        username: 'admin',
        email: 'admin@example.com',
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
        shortDescription: 'Backend API',
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
        title: 'Blog Platform',
        description:
          'A blogging platform with rich text editing and user management',
        shortDescription: 'Blogging platform',
        liveUrl: 'https://blog.example.com',
        repoUrl: 'https://github.com/cativo23/blog-platform',
        isFeatured: false,
        techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
        content: `# Blog Platform

A modern blogging platform with rich text editing capabilities.

## Features

- Markdown editor
- User authentication
- Comment system
- Tag management`,
        heroImage: 'https://blog.example.com/hero.png',
        features: ['Markdown support', 'User management', 'SEO friendly'],
        status: 'Completed',
      }),
      projectRepo.create({
        title: 'Blog Platform',
        description:
          'A blogging platform with rich text editing and user management',
        shortDescription: 'Blogging platform',
        liveUrl: 'https://blog.example.com',
        repoUrl: 'https://github.com/cativo23/blog-platform',
        isFeatured: false,
        techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
        content: `# Blog Platform

A modern blogging platform with rich text editing capabilities.

## Features

- Markdown editor
- User authentication
- Comment system
- Tag management`,
        heroImage: 'https://blog.example.com/hero.png',
        features: ['Markdown support', 'User management', 'SEO friendly'],
        status: 'Completed',
      }),
      projectRepo.create({
        title: 'E-commerce Store',
        description:
          'An e-commerce store with shopping cart and payment integration',
        shortDescription: 'E-commerce application',
        liveUrl: 'https://store.example.com',
        repoUrl: 'https://github.com/cativo23/ecommerce-store',
        isFeatured: false,
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
        content: `# E-commerce Store

Full-featured e-commerce platform with payment processing.

## Features

- Product catalog
- Shopping cart
- Stripe payment integration
- Order management`,
        heroImage: 'https://store.example.com/hero.png',
        features: [
          'Payment integration',
          'Inventory management',
          'Order tracking',
        ],
        status: 'In Progress',
      }),
      projectRepo.create({
        title: 'Task Manager',
        description:
          'A task management app with user authentication and real-time updates',
        shortDescription: 'Task management application',
        liveUrl: 'https://tasks.example.com',
        repoUrl: 'https://github.com/cativo23/task-manager',
        isFeatured: false,
        techStack: ['Angular', 'Firebase', 'TypeScript'],
        content: `# Task Manager

Real-time task management application with team collaboration features.

## Features

- Real-time sync
- Team collaboration
- Task priorities
- Due dates and reminders`,
        heroImage: 'https://tasks.example.com/hero.png',
        features: [
          'Real-time updates',
          'Team collaboration',
          'Mobile responsive',
        ],
        status: 'Completed',
      }),
      projectRepo.create({
        title: 'Social Media App',
        description:
          'A social media application with user profiles and messaging features',
        shortDescription: 'Social media platform',
        liveUrl: 'https://social.example.com',
        repoUrl: 'https://github.com/cativo23/social-media-app',
        isFeatured: false,
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
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
