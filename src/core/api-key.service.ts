import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '@core/entities/api-key.entity';

import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(description?: string): Promise<ApiKey> {
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = this.apiKeyRepository.create({ key, description });
    return this.apiKeyRepository.save(apiKey);
  }

  async findAll(): Promise<Partial<ApiKey>[]> {
    const keys = await this.apiKeyRepository.find();
    // Do not expose the actual key for security, only show id, description, isActive, createdAt, updatedAt
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
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key, isActive: true },
    });
    return !!apiKey;
  }

  async revoke(key: string): Promise<void> {
    await this.apiKeyRepository.update({ key }, { isActive: false });
  }
}
