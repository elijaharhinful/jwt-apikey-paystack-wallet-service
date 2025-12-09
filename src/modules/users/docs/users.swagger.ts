import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

export function UserDocs() {
  return applyDecorators(ApiTags('Users'));
}

export function FindUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Find user by ID' }),
    ApiParam({ name: 'id', type: 'string' }),
    ApiResponse({ status: 200, description: 'User profile' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function CreateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create user (Internal/Debug)' }),
    ApiResponse({ status: 201, description: 'User created' }),
  );
}
