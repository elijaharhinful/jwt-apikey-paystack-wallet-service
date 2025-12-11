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
    ApiOperation({
      summary: 'Initiate Google Authentication',
      description: `
**⚠️ IMPORTANT: How to Test This Endpoint**

This endpoint initiates Google OAuth2 authentication flow. Due to the nature of OAuth redirects, 
you CANNOT test this directly in Swagger UI.

**Testing Instructions:**

1. **Copy the URL**: Right-click on "GET /auth/google" and copy the full URL
   - Example(localhost): \`http://localhost:3000/auth/google\`
   - Example(live): \`https://jwt-apikey-paystack-wallet-service.onrender.com/auth/google\`

2. **Open in Browser**: Paste the URL in a new browser tab/window

3. **Google Sign-In**: You will be redirected to Google's sign-in page
   - Sign in with your Google account
   - Grant the requested permissions

4. **Automatic Redirect**: After successful authentication, Google will redirect you to:
   - \`http://localhost:3000/auth/google/callback\` on localhost or 
   - \`https://jwt-apikey-paystack-wallet-service.onrender.com/auth/google/callback\` on live

5. **Get Your JWT**: The callback will return your user profile and JWT token
   - Copy the JWT token from the response
   - Use this token for authenticated endpoints (set in "Authorize" → "JWT")

**Response Format (from callback):**
\`\`\`json
{
  "user": {
    "id": "uuid",
    "email": "your-email@gmail.com",
    "name": "Your Name"
  },
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Note**: This is a standard OAuth2 flow that requires browser interaction. 
It cannot be tested via Swagger's "Try it out" button.
      `.trim(),
    }),
    ApiResponse({
      status: 302,
      description: 'Redirects to Google Sign-In page',
    }),
  );
}

export function GoogleCallbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google Authentication Callback',
      description: `
**⚠️ IMPORTANT: This endpoint is called automatically by Google**

This is the OAuth2 callback endpoint that Google redirects to after successful authentication.
You should NOT call this endpoint directly.

**How It Works:**

1. User initiates login via \`GET /auth/google\`
2. User signs in with Google
3. **Google automatically redirects** to this callback endpoint
4. This endpoint processes the authentication
5. Returns user profile and JWT token

**What You'll See:**

After successful Google sign-in, your browser will show a JSON response:

\`\`\`json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "your-email@gmail.com",
    "google_id": "109011518663757710676",
    "wallet": {
      "balance": 10930000,
      "currency": "kobo",
      "wallet_number": "3511720321883"
    }
  },
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InlvdXItZW1haWxAZ21haWwuY29tIiwiaWF0IjoxNzMzODIxMjAwLCJleHAiOjE3MzM5MDc2MDB9.signature"
}
\`\`\`

**Note**: The wallet balance is in kobo (100 kobo = ₦1).


**Next Steps:**

1. **Copy the JWT token** from the response
2. In Swagger UI, click the **"Authorize"** button (top right)
3. Select **"JWT (http, Bearer)"**
4. Paste your token in the format: \`Bearer your_jwt_token_here\`
5. Click **"Authorize"** then **"Close"**
6. You can now test authenticated endpoints!

**Note**: This endpoint is part of the OAuth2 flow and is automatically invoked by Google.
Do not attempt to call it directly via Swagger's "Try it out" button.
      `.trim(),
    }),
    ApiResponse({
      status: 200,
      description: 'User profile and JWT token',
      schema: {
        example: {
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@gmail.com',
            google_id: '109011518663757710676',
            created_at: '2025-12-10T09:26:40.633Z',
            wallet: {
              id: '4675bd2c-e625-44e2-963b-aa155387b20d',
              balance: 10930000,
              currency: 'kobo',
              created_at: '2025-12-10T09:26:40.633Z',
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              wallet_number: '3511720321883',
            },
          },
          jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwiaWF0IjoxNzMzODIxMjAwLCJleHAiOjE3MzM5MDc2MDB9.signature',
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
