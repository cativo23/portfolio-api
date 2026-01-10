import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user information in login response
 */
export class LoginUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;
}

/**
 * DTO for login response
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2026-01-09T14:05:00.000Z',
  })
  expires_at: Date;

  @ApiProperty({
    description: 'User information',
    type: LoginUserDto,
  })
  user: LoginUserDto;
}
