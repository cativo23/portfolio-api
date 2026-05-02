import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Public } from '@auth/decorators/public.decorator';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get professional profile information',
    description:
      "Returns Carlos Cativo's professional profile including experience, skills, and differentiators.",
  })
  @ApiResponse({
    status: 200,
    description: 'Profile information retrieved successfully',
    type: ProfileResponseDto,
  })
  getProfile(): ProfileResponseDto {
    return this.profileService.getProfile();
  }
}
