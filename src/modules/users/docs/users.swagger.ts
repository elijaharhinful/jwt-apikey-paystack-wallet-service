import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';

export function UserDocs() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('JWT'),
    ApiSecurity('API-Key'),
  );
}

export function FindUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by ID' }),
    ApiParam({ name: 'id', type: 'string', description: 'User ID' }),
    ApiResponse({
      status: 200,
      description: 'User found',
      schema: {
        example: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          created_at: '2025-12-10T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}
