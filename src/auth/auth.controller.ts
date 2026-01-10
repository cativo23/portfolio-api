import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ErrorCode, ErrorResponseDto, SuccessResponseDto } from '@core/dto';
import { AuthService } from '@auth/auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { LoginDto } from '@auth/dto/login.dto';
import { LoginResponseDto } from '@auth/dto/login-response.dto';
import { AuthGuard } from '@auth/auth.guard';
import { User } from '@users/entities/user.entity';
import { User as UserDecorator } from '@auth/decorators/user.decorator';
import { ApiCustomResponses } from '@core/decorators';
import { AuthenticatedRequest } from '@core/types/authenticated-request.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Handles user login by validating credentials and returning an authentication token.
   *
   * @param loginDto - The login details provided by the user
   * @returns Promise resolving to the authentication token and user details if login is successful
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Login successful - returns authentication token and user data',
      type: SuccessResponseDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed - Invalid input data',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials - Email or password incorrect',
      type: ErrorResponseDto,
      schema: {
        example: {
          status: 'error',
          request_id: 'req_88229911aabb',
          error: {
            code: ErrorCode.AUTHENTICATION_ERROR,
            message: 'Password does not match',
            path: '/api/v1/auth/login',
            timestamp: '2026-01-08T14:05:00Z',
          },
        },
      },
    }),
  )
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'User Registration' })
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User registered successfully',
      type: User,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Validation failed - Invalid input data',
      type: ErrorResponseDto,
    }),
  )
  register(@Body() signUpDto: CreateUserDto): Promise<User> {
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
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile retrieved successfully',
      schema: {
        example: {
          user: {
            id: 1,
            email: 'user@example.com',
            username: 'username',
          },
          req_user: {
            id: 1,
            email: 'user@example.com',
            username: 'username',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Missing or invalid authentication token',
      type: ErrorResponseDto,
    }),
  )
  profile(@Request() req: AuthenticatedRequest, @UserDecorator() user: User) {
    return {
      user: user,
    };
  }
}
