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
        description: 'Full stack portfolio website built with NestJS and React',
        shortDescription: 'Personal portfolio site',
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/example/portfolio',
        isFeatured: true,
      }),
      projectRepo.create({
        title: 'API Service',
        description: 'REST API for managing projects and contacts',
        shortDescription: 'Backend API',
        liveUrl: null,
        repoUrl: 'https://github.com/example/api',
        isFeatured: false,
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
