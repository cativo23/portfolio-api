import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '@app/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { User } from '@app/users/entities/user.entity';
import { User as UserDecorator } from './decorators/user.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user login by validating credentials and returning an authentication token.
   *
   * @param {LoginDto} loginDto - The login details provided by the user.
   * @returns {Promise<any>} A promise that resolves with the authentication token and user details if the login is successful.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: 'The record found',
    type: CreateUserDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({
    status: 200,
    description: 'The record found',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestException,
  })
  register(
    @Body() signUpDto: CreateUserDto,
  ): Promise<User> | BadRequestException {
    return this.authService.register({
      username: signUpDto.username,
      email: signUpDto.email,
      password: signUpDto.password,
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Profile' })
  profile(@Request() req: any, @UserDecorator() user: any) {
    return {
      user: user,
      req_user: req.user,
    };
  }
}
