import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyService } from '@core/api-key.service';
import { AuthenticationException } from '@core/exceptions';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Accept API key from header `x-api-key`, Authorization header as `ApiKey <key>`,
    // or query param `api_key` for flexibility when calling from curl or browsers.
    let apiKey = request.headers['x-api-key'] || request.query?.api_key;
    if (!apiKey) {
      const authHeader =
        request.headers['authorization'] || request.headers['Authorization'];
      if (authHeader && typeof authHeader === 'string') {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'apikey') {
          apiKey = parts[1];
        }
      }
    }

    if (!apiKey) {
      throw new AuthenticationException('API key is missing');
    }

    const valid = await this.apiKeyService.validate(apiKey);
    if (!valid) {
      throw new AuthenticationException('Invalid API key');
    }
    return true;
  }
}
