import * as bcrypt from 'bcrypt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@users/entities/user.entity';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';

/**
 * Service responsible for user management operations
 *
 * Provides methods for creating, retrieving, updating and deleting users
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Finds all users
   *
   * @returns Promise resolving to array of user entities
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Finds a user by their ID
   *
   * @param id - The user ID
   * @returns Promise resolving to the user entity
   * @throws NotFoundException if user not found
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Finds a user by their email address
   *
   * @param email - The email address to search for
   * @returns Promise resolving to the user entity if found, or undefined if not found
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) {
      this.logger.log(`User with email ${email} not found.`);
      return undefined;
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

  /**
   * Updates an existing user
   *
   * @param id - The user ID
   * @param updateUserDto - Data transfer object containing update fields
   * @returns Promise resolving to the updated user entity
   * @throws NotFoundException if user not found
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  /**
   * Soft-deletes a user
   *
   * @param id - The user ID
   * @returns Promise resolving when deletion is complete
   * @throws NotFoundException if user not found
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }
}
