import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { RolloverApiKeyDto } from '../dto/rollover-api-key.dto';
import { RevokeApiKeyDto } from '../dto/revoke-api-key.dto';

export function ApiKeyDocs() {
  return applyDecorators(ApiTags('Api Keys'));
}

export function CreateApiKeyDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new API Key' }),
    ApiBearerAuth('JWT'),
    ApiBody({ type: CreateApiKeyDto }),
    ApiResponse({
      status: 201,
      description: 'API Key created',
      schema: {
        example: {
          id: 'uuid',
          api_key: 'sk_live_...',
          expires_at: '2025-01-01T...',
        },
      },
    }),
  );
}

export function RolloverApiKeyDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Rollover an expired API Key' }),
    ApiBearerAuth('JWT'),
    ApiBody({ type: RolloverApiKeyDto }),
    ApiResponse({
      status: 201,
      description: 'New API Key created with same permissions',
      schema: {
        example: {
          id: 'uuid',
          api_key: 'sk_live_new...',
          expires_at: '2025-02-01T...',
        },
      },
    }),
  );
}

export function RevokeApiKeyDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke an API Key' }),
    ApiBearerAuth('JWT'),
    ApiBody({ type: RevokeApiKeyDto }),
    ApiResponse({
      status: 200,
      description: 'API Key revoked',
    }),
  );
}
