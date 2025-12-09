import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import {
  ApiKeyDocs,
  CreateApiKeyDocs,
  RolloverApiKeyDocs,
  RevokeApiKeyDocs,
} from './docs/api-key.swagger';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';

@Controller('keys')
@UseGuards(AuthGuard('jwt')) // Only logged-in users can manage keys
@ApiKeyDocs()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('create')
  @CreateApiKeyDocs()
  async createKey(@Req() req: RequestWithUser, @Body() body: CreateApiKeyDto) {
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
    @Body() body: RolloverApiKeyDto,
  ) {
    return this.apiKeysService.rolloverApiKey(
      req.user,
      body.expired_key_id,
      body.expiry,
    );
  }

  @Post('revoke')
  @UseGuards(AuthGuard('jwt'))
  @RevokeApiKeyDocs()
  async revokeKey(@Req() req: RequestWithUser, @Body() body: RevokeApiKeyDto) {
    return this.apiKeysService.revokeApiKey(req.user, body.key_id);
  }
}
