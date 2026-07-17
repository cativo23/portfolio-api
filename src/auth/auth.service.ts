import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { RegisterDto } from '@auth/dto/register.dto';
import { User } from '@users/entities/user.entity';
import { ConflictException, AuthenticationException } from '@core/exceptions';

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

    // Hashing is owned by UsersService.create() so every insert path hashes
    // exactly once — forward the raw password here to avoid double-hashing.
    return await this.usersService.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });
  }

  /**
   * Authenticates a user and generates a JWT token
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to an object containing the access token, expiration time, and user information
   * @throws AuthenticationException if the user is not found or the password is incorrect
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    expires_at: Date;
    user: { id: number; username: string; email: string };
  }> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email, roles: user.roles };

    const access_token = await this.jwtService.signAsync(payload);
    const decoded = this.jwtService.decode(access_token);

    if (
      !decoded ||
      typeof decoded === 'string' ||
      typeof decoded['exp'] !== 'number'
    ) {
      throw new InternalServerErrorException(
        'JWT issued without exp claim — check JWT_EXPIRES_IN configuration',
      );
    }

    return {
      access_token,
      expires_at: new Date(decoded['exp'] * 1000),
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
   * @throws AuthenticationException if the user is not found or the password is incorrect
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !user.password) {
      // Also covers users inserted directly into the DB without a hashed
      // password: bcrypt.compare throws on a null/undefined hash, which would
      // otherwise surface as a 500 instead of a clean 401. Same message as an
      // incorrect password to prevent user enumeration.
      throw new AuthenticationException('Invalid email or password');
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationException('Invalid email or password');
    }
    return user;
  }
}
