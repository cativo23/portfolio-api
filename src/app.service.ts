import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '@config/configuration.types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ApiInfoResponseDto } from '@src/app/dto/api-info-response.dto';

@Injectable()
export class AppService {
  private readonly packageJson: {
    version: string;
    name: string;
    description: string;
  };

  constructor(private readonly configService: ConfigService) {
    // Read package.json to get version and name
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      this.packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch {
      // Fallback if package.json can't be read
      this.packageJson = {
        version: 'unknown',
        name: 'portfolio-api',
        description: 'RESTful API for managing portfolio projects',
      };
    }
  }

  getApiInfo(): ApiInfoResponseDto {
    const app = this.configService.getOrThrow<AppConfig>('app');
    const environment = app.nodeEnv;
    const port = String(app.port);

    // Determine base URL based on environment
    const baseUrl =
      environment === 'production'
        ? 'https://api.cativo.dev'
        : `http://localhost:${port}`;

    return {
      name: this.packageJson.name || 'Portfolio API',
      version: this.packageJson.version || 'unknown',
      description:
        this.packageJson.description ||
        'RESTful API for managing portfolio projects',
      environment,
      documentation: `${baseUrl}/docs`,
      health: `${baseUrl}/health`,
      status: 'operational',
      timestamp: new Date().toISOString(),
    };
  }
}
