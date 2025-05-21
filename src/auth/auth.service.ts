import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@app/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@app/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(payload: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(payload.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcryptjs.hash(payload.password, 10);

    return await this.usersService.create({
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
    });
  }

  async login(email, password): Promise<{ access_token: string, expires_at: Date, user: { id: number, username: string, email: string } }> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload);

    // Return token, until when its valid the toke and user info
    return {
      access_token: access_token,
      expires_at: new Date(Date.now() + (this.configService.get<number>('JWT_EXPIRES_IN') * 1000)),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    }
  }


  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password does not match');
    }
    return user;
  }
}
