import AppDataSource from '../config/typeorm.config.prod';
import { User } from '@users/entities/user.entity';
import { Project } from '@projects/entities/project.entity';
import { Contact } from '@contacts/entities/contact.entity';
import * as bcryptjs from 'bcryptjs';

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
    const password = await bcryptjs.hash(process.env.DEFAULT_USER_PASSWORD, 10);
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
