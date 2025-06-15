import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Service responsible for user management operations
 *
 * Provides methods for creating and retrieving user information
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by their email address
   *
   * @param email - The email address to search for
   * @returns Promise resolving to the user entity if found
   * @throws NotFoundException if the user with the specified email is not found
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) {
      this.logger.log(`User with email ${email} not found.`);
      throw new NotFoundException(`User with email ${email} not found.`);
    }
    this.logger.log(`User with email ${email} found.`);
    return user;
  }

  /**
   * Creates a new user in the system
   *
   * @param createUserDto - Data transfer object containing user details
   * @returns Promise resolving to the created user entity
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
    });
    return this.userRepository.save(user);
  }
}
