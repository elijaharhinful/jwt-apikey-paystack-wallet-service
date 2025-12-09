import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaystackModule } from '../paystack/paystack.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    PaystackModule,
    ApiKeysModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
