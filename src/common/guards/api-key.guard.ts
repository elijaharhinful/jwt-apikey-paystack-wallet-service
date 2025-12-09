import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return false; // Let other guards (like JWT) try if used in composition, or fail if standalone
    }

    const key = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    const user = await this.apiKeysService.validateApiKey(key);

    if (!user) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (request as any).user = user;
    return true;
  }
}
