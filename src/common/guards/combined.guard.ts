import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class CombinedAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (apiKey) {
      const key = Array.isArray(apiKey) ? apiKey[0] : apiKey;
      const user = await this.apiKeysService.validateApiKey(key);
      if (!user) {
        throw new UnauthorizedException('Invalid API Key');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request as any).user = user;
      return true;
    }

    // Fallback to JWT
    return super.canActivate(context) as Promise<boolean>;
  }
}
