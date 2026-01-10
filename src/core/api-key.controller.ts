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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ValidationPipe } from '@core/pipes';
import { AuthGuard } from '@auth/auth.guard';
import { ApiKeyService } from '@core/api-key.service';
import { SuccessResponseDto, ErrorResponseDto } from '@core/dto';
import { ApiCustomResponses } from '@core/decorators';
import { ApiKeyListItem } from '@core/types/api-key-list-item.interface';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) { }

  /**
   * Create a new API key (admin only)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new API key (admin only)' })
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'API key created successfully',
      type: SuccessResponseDto,
      schema: {
        example: {
          status: 'success',
          request_id: 'req_88229911aabb',
          data: {
            id: 1,
            key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            description: 'Frontend public access',
          },
        },
      },
    }),
  )
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
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of API keys',
      type: SuccessResponseDto,
      schema: {
        example: {
          status: 'success',
          request_id: 'req_88229911aabb',
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
    }),
  )
  async findAll(): Promise<SuccessResponseDto<ApiKeyListItem[]>> {
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
  @ApiParam({ name: 'id', type: Number, description: 'API key ID' })
  @ApiCustomResponses(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'API key revoked successfully',
      type: SuccessResponseDto,
      schema: {
        example: {
          status: 'success',
          request_id: 'req_88229911aabb',
          data: { id: 1 },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'API key not found',
      type: ErrorResponseDto,
    }),
  )
  async revoke(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<{ id: number }>> {
    await this.apiKeyService.revokeById(id);
    return new SuccessResponseDto({ id });
  }
}
