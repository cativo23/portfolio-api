import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from '@src/app.service';
import { ApiInfoResponseDto } from '@src/app/dto/api-info-response.dto';

@ApiTags('API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get API information',
    description:
      'Returns information about the API including version, documentation links, and status.',
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    type: ApiInfoResponseDto,
  })
  getApiInfo(): ApiInfoResponseDto {
    return this.appService.getApiInfo();
  }
}
