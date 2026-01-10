import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { RegisterDto } from '@auth/dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@users/entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  AuthenticationException,
} from '@core/exceptions';

/**
 * Service responsible for authentication-related operations
 *
 * Provides methods for user registration, login, and credential validation
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registers a new user in the system
   *
   * @param payload - Data transfer object containing user registration details
   * @returns Promise resolving to the created user entity
   * @throws ConflictException if the email already exists
   */
  async register(payload: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(payload.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcryptjs.hash(payload.password, 10);

    return await this.usersService.create({
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
    });
  }

  /**
   * Authenticates a user and generates a JWT token
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to an object containing the access token, expiration time, and user information
   * @throws NotFoundException if the user is not found
   * @throws AuthenticationException if the password is incorrect
   */
  async login(
    email,
    password,
  ): Promise<{
    access_token: string;
    expires_at: Date;
    user: { id: number; username: string; email: string };
  }> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload);

    // Return token, until when its valid the toke and user info
    return {
      access_token: access_token,
      expires_at: new Date(
        Date.now() + this.configService.get<number>('JWT_EXPIRES_IN') * 1000,
      ),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  /**
   * Validates user credentials
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to the user entity if validation is successful
   * @throws NotFoundException if the user is not found
   * @throws AuthenticationException if the password is incorrect
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch: boolean = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationException('Invalid credentials');
    }
    return user;
  }
}
