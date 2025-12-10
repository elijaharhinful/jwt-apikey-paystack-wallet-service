import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
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

  @Delete(':key_id')
  @RevokeApiKeyDocs()
  async revokeKey(@Req() req: RequestWithUser, @Param('key_id') keyId: string) {
    await this.apiKeysService.revokeApiKey(req.user, keyId);
    return { message: 'API key revoked successfully' };
  }
}
