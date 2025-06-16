import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@auth/auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
    constructor(private readonly moduleRef: ModuleRef) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Dynamically resolve guards
        const authGuard = this.moduleRef.get(AuthGuard, { strict: false });
        const apiKeyGuard = this.moduleRef.get(ApiKeyGuard, { strict: false });

        // Try JWT first
        try {
            if (authGuard && (await authGuard.canActivate(context))) {
                return true;
            }
        } catch { }
        // Try API Key
        try {
            if (apiKeyGuard && (await apiKeyGuard.canActivate(context))) {
                return true;
            }
        } catch { }
        return false;
    }
}
