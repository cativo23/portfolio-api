import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { ApiKeyConfig } from '@src/config/api-key.config';
import { ApiKey } from '@core/entities/api-key.entity';
import { ApiKeyListItem } from '@core/types/api-key-list-item.interface';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly apiKeySecret: string;

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly configService: ConfigService,
  ) {
    this.apiKeySecret =
      this.configService.getOrThrow<ApiKeyConfig>('apiKey').secret;
  }

  private hashKey(plainKey: string): string {
    return crypto
      .createHmac('sha256', this.apiKeySecret)
      .update(plainKey)
      .digest('hex');
  }

  async create(
    description?: string,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = this.hashKey(plainKey);
    const apiKey = this.apiKeyRepository.create({ hashedKey, description });
    return { apiKey: await this.apiKeyRepository.save(apiKey), plainKey };
  }

  async findAll(): Promise<ApiKeyListItem[]> {
    const keys = await this.apiKeyRepository.find();
    return keys.map(({ id, description, isActive, createdAt, updatedAt }) => ({
      id,
      description,
      isActive,
      createdAt,
      updatedAt,
    }));
  }

  async revokeById(id: number): Promise<void> {
    await this.apiKeyRepository.update({ id }, { isActive: false });
  }

  async validate(key: string): Promise<boolean> {
    const hashedKey = this.hashKey(key);
    const apiKey = await this.apiKeyRepository.findOne({
      where: { hashedKey, isActive: true },
    });
    return !!apiKey;
  }
}
