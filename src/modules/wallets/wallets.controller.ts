import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Headers,
  Param,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CombinedAuthGuard } from '../../common/guards/combined.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import {
  WalletDocs,
  DepositDocs,
  WebhookDocs,
  DepositStatusDocs,
  TransferDocs,
  BalanceDocs,
  TransactionsDocs,
} from './docs/wallets.swagger';
import type { RequestWithUser } from '../../modules/auth/interfaces/request-with-user.interface';
import type { PaystackWebhookEvent } from '../paystack/interfaces/paystack-webhook-event.interface';
import { TransactionHistoryResponse } from './interfaces/transaction-history-response.interface';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('wallet')
@WalletDocs()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('deposit')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions('deposit')
  @DepositDocs()
  deposit(@Req() req: RequestWithUser, @Body('amount') amount: number) {
    return this.walletsService.deposit(req.user, amount);
  }

  @Post('paystack/webhook')
  @WebhookDocs()
  handleWebhook(
    @Body() body: PaystackWebhookEvent,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.walletsService.handleWebhook(body, signature);
  }

  @Get('deposit/:reference/status')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions('read')
  @DepositStatusDocs()
  getDepositStatus(@Param('reference') reference: string) {
    return this.walletsService.getDepositStatus(reference);
  }

  @Post('transfer')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions('transfer')
  @TransferDocs()
  transfer(@Req() req: RequestWithUser, @Body() body: CreateTransferDto) {
    return this.walletsService.transfer(
      req.user,
      body.wallet_number,
      body.amount,
    );
  }

  @Get('balance')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions('read')
  @BalanceDocs()
  getBalance(@Req() req: RequestWithUser) {
    return this.walletsService.getBalance(req.user);
  }

  @Get('transactions')
  @UseGuards(CombinedAuthGuard, PermissionsGuard)
  @RequirePermissions('read')
  @TransactionsDocs()
  getTransactions(
    @Req() req: RequestWithUser,
  ): Promise<TransactionHistoryResponse[]> {
    return this.walletsService.getTransactions(req.user);
  }
}
