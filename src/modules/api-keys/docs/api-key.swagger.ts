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
    ApiResponse({
      status: 200,
      description: 'API Key revoked successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'API key revoked successfully' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Key not found',
    }),
    ApiResponse({
      status: 400,
      description: 'Key is already revoked',
    }),
  );
}
