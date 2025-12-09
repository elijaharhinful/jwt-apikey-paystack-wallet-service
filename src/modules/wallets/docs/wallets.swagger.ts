import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export function WalletDocs() {
  return applyDecorators(
    ApiTags('Wallets'),
    ApiBearerAuth('JWT'),
    ApiSecurity('API-Key'),
  );
}

export function DepositDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Deposit funds via Paystack' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { amount: { type: 'number', example: 5000 } },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Paystack initialization data',
      schema: {
        example: { reference: 'ref...', authorization_url: 'https://...' },
      },
    }),
  );
}

export function TransferDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer funds to another wallet' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          wallet_number: { type: 'string', description: 'Recipient Wallet ID' },
          amount: { type: 'number', example: 1000 },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Transfer successful',
      schema: { example: { status: 'success', message: 'Transfer completed' } },
    }),
  );
}

export function BalanceDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get wallet balance' }),
    ApiResponse({
      status: 200,
      description: 'Current balance',
      schema: { example: { balance: 15000 } },
    }),
  );
}

export function TransactionsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get transaction history' }),
    ApiResponse({
      status: 200,
      description: 'List of transactions',
      schema: {
        example: [
          {
            id: 'uuid',
            amount: 5000,
            type: 'deposit',
            status: 'success',
            created_at: 'date',
          },
        ],
      },
    }),
  );
}

export function DepositStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Check deposit status' }),
    ApiParam({ name: 'reference', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'Transaction status',
      schema: {
        example: { reference: 'ref...', status: 'success', amount: 5000 },
      },
    }),
  );
}

export function WebhookDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Paystack Webhook Handler' }),
    ApiResponse({ status: 201, description: 'Processed' }),
  );
}
