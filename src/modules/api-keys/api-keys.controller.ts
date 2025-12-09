import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import {
  ApiKeyDocs,
  CreateApiKeyDocs,
  RolloverApiKeyDocs,
} from './docs/api-key.swagger';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('keys')
@UseGuards(AuthGuard('jwt')) // Only logged-in users can manage keys
@ApiKeyDocs()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('create')
  @CreateApiKeyDocs()
  async createKey(
    @Req() req: RequestWithUser,
    @Body() body: { name: string; permissions: string[]; expiry: string },
  ) {
    return this.apiKeysService.createApiKey(
      req.user,
      body.name,
      body.permissions,
      body.expiry,
    );
  }

  @Post('rollover')
  @RolloverApiKeyDocs()
  async rolloverKey(
    @Req() req: RequestWithUser,
    @Body() body: { expired_key_id: string; expiry: string },
  ) {
    return this.apiKeysService.rolloverApiKey(
      req.user,
      body.expired_key_id,
      body.expiry,
    );
  }

  @Post('revoke')
  @UseGuards(AuthGuard('jwt'))
  // TODO: Add RevokeDocs
  async revokeKey(@Req() req: RequestWithUser, @Body('key_id') keyId: string) {
    return this.apiKeysService.revokeApiKey(req.user, keyId);
  }
}
