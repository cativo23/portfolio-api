import { DataSource } from 'typeorm';
import { BaseSeeder } from './base.seeder';
import { User } from '@users/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Seeder for the User entity
 * Creates test users in the database
 */
export class UserSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  /**
   * Seeds the database with test users
   */
  public async seed(): Promise<void> {
    // Clear existing users
    await this.clear('user');

    const userRepository = this.dataSource.getRepository(User);

    // Create test users
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await this.hashPassword('admin123'),
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: await this.hashPassword('user123'),
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: await this.hashPassword('user123'),
      },
    ];

    // Save users to database
    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      this.logger.log(`Created user: ${user.username}`);
    }
  }

  /**
   * Hashes a password using bcrypt
   * @param password The plain text password to hash
   * @returns The hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
