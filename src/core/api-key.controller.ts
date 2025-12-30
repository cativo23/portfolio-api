import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from '@core/pipes';
import { AuthGuard } from '@auth/auth.guard';
import { ApiKeyService } from '@core/api-key.service';
import { SuccessResponseDto, ErrorResponseDto } from '@core/dto';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Create a new API key (admin only)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new API key (admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'API key created',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          description: 'Frontend public access',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async create(
    @Body('description') description?: string,
  ): Promise<
    SuccessResponseDto<{ id: number; key: string; description?: string }>
  > {
    const apiKey = await this.apiKeyService.create(description);
    return new SuccessResponseDto({
      id: apiKey.id,
      key: apiKey.key, // Only return key at creation
      description: apiKey.description,
    });
  }

  /**
   * List all API keys (admin only, does not expose key value)
   */
  @Get()
  @ApiOperation({
    summary: 'List all API keys (admin only, does not expose key value)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of API keys',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 1,
            description: 'Frontend public access',
            isActive: true,
            createdAt: '2025-06-15T00:00:00.000Z',
            updatedAt: '2025-06-15T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async findAll(): Promise<SuccessResponseDto<any[]>> {
    const keys = await this.apiKeyService.findAll();
    return new SuccessResponseDto(keys);
  }

  /**
   * Revoke (deactivate) an API key by ID (admin only)
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Revoke (deactivate) an API key by ID (admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API key revoked',
    schema: {
      example: {
        status: 'success',
        data: { id: 1 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'API key not found',
    type: ErrorResponseDto,
  })
  async revoke(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<{ id: number }>> {
    await this.apiKeyService.revokeById(Number(id));
    return new SuccessResponseDto({ id: Number(id) });
  }
}
