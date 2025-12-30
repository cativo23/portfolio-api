import AppDataSource from '../config/typeorm.config';
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
    const password = await bcryptjs.hash('password123', 10);
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
