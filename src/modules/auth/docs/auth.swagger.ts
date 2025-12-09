import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

export function AuthDocs() {
  return applyDecorators(ApiTags('Auth'));
}

export function GoogleAuthDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Initiate Google Authentication' }),
    ApiResponse({ status: 302, description: 'Redirects to Google Sign-In' }),
  );
}

export function GoogleCallbackDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Google Authentication Callback' }),
    ApiResponse({
      status: 200,
      description: 'User profile and JWT',
      schema: {
        example: {
          user: { id: 'uuid', email: 'test@test.com' },
          jwt: 'base64token',
        },
      },
    }),
  );
}

export function CreateApiKeyDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new API Key' }),
    ApiBearerAuth('JWT'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
          expiry: { type: 'string', example: '1D' },
        },
      },
    }),
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
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          expired_key_id: { type: 'string' },
          expiry: { type: 'string', example: '1M' },
        },
      },
    }),
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
