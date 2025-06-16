import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly apiKeyService: ApiKeyService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }
        const valid = await this.apiKeyService.validate(apiKey);
        if (!valid) {
            throw new UnauthorizedException('Invalid API key');
        }
        return true;
    }
}
