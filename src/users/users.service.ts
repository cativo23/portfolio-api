import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) {
      this.logger.log(`User with email ${email} not found.`);
      throw new NotFoundException(`User with email ${email} not found.`);
    }
    this.logger.log(`User with email ${email} found.`);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
    });
    return this.userRepository.save(user);
  }
}
