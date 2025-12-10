import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { PaystackService } from '../paystack/paystack.service';
import { User } from '../users/entities/user.entity';
import { PaystackWebhookEvent } from '../paystack/interfaces/paystack-webhook-event.interface';
import { WalletBalanceResponse } from './interfaces/wallet-balance-response.interface';
import { DepositStatusResponse } from './interfaces/deposit-status-response.interface';
import { TransactionHistoryResponse } from './interfaces/transaction-history-response.interface';
import * as crypto from 'crypto';
@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(Wallet)
    public readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly paystackService: PaystackService,
    private readonly dataSource: DataSource,
  ) {}

  public async generateUniqueWalletNumber(): Promise<string> {
    let walletNumber: string;
    let existing;

    do {
      walletNumber = Math.floor(
        1000000000000 + Math.random() * 9000000000000,
      ).toString();
      existing = await this.walletRepository.findOne({
        where: { wallet_number: walletNumber },
      });
    } while (existing);

    return walletNumber;
  }

  public async create(user: User): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      user,
      balance: 0,
      wallet_number: await this.generateUniqueWalletNumber(),
    });
    return this.walletRepository.save(wallet);
  }

  async deposit(user: User, amount: number) {
    if (!Number.isInteger(amount)) {
      throw new BadRequestException('Amount must be in kobo (integer)');
    }

    const reference = `REF-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Check if reference already exists
    const existingTx = await this.transactionRepository.findOne({
      where: { reference },
    });
    if (existingTx) {
      throw new ConflictException('Transaction reference already exists');
    }

    // Create PENDING transaction
    // Need wallet first
    let wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) wallet = await this.create(user); // Should exist from user creation

    const transaction = this.transactionRepository.create({
      wallet,
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      reference,
    });
    await this.transactionRepository.save(transaction);

    // Call Paystack
    const paystackData = await this.paystackService.initializeTransaction(
      user.email,
      amount,
      reference,
    );

    return paystackData;
  }

  async handleWebhook(body: PaystackWebhookEvent, signature: string) {
    if (!this.paystackService.verifyWebhookSignature(signature, body)) {
      throw new BadRequestException('Invalid signature');
    }

    const event = body.event;
    const data = body.data;

    if (event === 'charge.success') {
      const reference = data.reference;

      this.logger.log(`Processing valid webhook for ${reference}`);

      // Transactional update
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const transaction = await queryRunner.manager.findOne(Transaction, {
          where: { reference },
          relations: ['wallet'],
        });

        if (!transaction) {
          this.logger.warn(`Transaction not found for ref ${reference}`);
          await queryRunner.rollbackTransaction();
          return;
        }

        if (transaction.status === TransactionStatus.SUCCESS) {
          this.logger.log(`Transaction ${reference} already processed`);
          return;
        }

        // Verify amount matches
        // Both data.amount and transaction.amount are in kobo
        const amountPaid = data.amount;
        if (amountPaid !== transaction.amount) {
          this.logger.error(
            `Amount mismatch: expected ${transaction.amount} kobo, got ${amountPaid} kobo. Marking as failed.`,
          );
          transaction.status = TransactionStatus.FAILED;
          await queryRunner.manager.save(transaction);
          await queryRunner.commitTransaction();
          return { status: false };
        }

        transaction.status = TransactionStatus.SUCCESS;
        await queryRunner.manager.save(transaction);

        // Credit Wallet
        const walletLocked = await queryRunner.manager.findOne(Wallet, {
          where: { id: transaction.wallet.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!walletLocked)
          throw new InternalServerErrorException('Wallet lock failed');

        const currentBalance = parseInt(String(walletLocked.balance), 10) || 0;
        const newBalance = currentBalance + amountPaid;

        walletLocked.balance = newBalance;

        await queryRunner.manager.save(walletLocked);
        await queryRunner.commitTransaction();

        this.logger.log(`Wallet credited for ${reference}`);
      } catch (err: unknown) {
        await queryRunner.rollbackTransaction();
        if (err instanceof Error) {
          this.logger.error(`Webhook error: ${err.message}`);
        } else {
          this.logger.error(`Webhook error: Unknown error`);
        }
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    return { status: true };
  }

  async transfer(senderUser: User, recipientWalletId: string, amount: number) {
    if (amount <= 0)
      throw new BadRequestException(
        'Invalid amount: must be positive integer (kobo)',
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Prepare IDs
      // We need sender wallet ID first.
      const senderWalletSimple = await this.walletRepository.findOne({
        where: { user: { id: senderUser.id } },
      });
      if (!senderWalletSimple)
        throw new NotFoundException('Sender wallet not found');
      const senderWalletId = senderWalletSimple.id;

      if (senderWalletId === recipientWalletId)
        throw new BadRequestException('Cannot transfer to self');

      const firstId =
        senderWalletId < recipientWalletId ? senderWalletId : recipientWalletId;
      const secondId =
        senderWalletId < recipientWalletId ? recipientWalletId : senderWalletId;

      const wallets = await queryRunner.manager.find(Wallet, {
        where: [{ id: firstId }, { id: secondId }],
        lock: { mode: 'pessimistic_write' },
      });

      if (wallets.length !== 2)
        throw new NotFoundException('One or both wallets not found');

      const senderLocked = wallets.find((w) => w.id === senderWalletId);
      const recipientLocked = wallets.find((w) => w.id === recipientWalletId);

      if (!senderLocked || !recipientLocked)
        throw new NotFoundException('Wallet mismatch');

      if (Number(senderLocked.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Perform Transfer
      senderLocked.balance = Number(senderLocked.balance) - amount;
      recipientLocked.balance = Number(recipientLocked.balance) + amount;

      await queryRunner.manager.save([senderLocked, recipientLocked]);

      // Record Transactions
      // Sender Debit
      const debitTx = queryRunner.manager.create(Transaction, {
        wallet: senderLocked,
        amount: amount,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.SUCCESS,
        reference: `TRF-${Date.now()}--${crypto.randomBytes(4).toString('hex')}-DB`,
        metadata: { type: 'debit', receiver_wallet: recipientLocked.id },
      });

      // Receiver Credit
      const creditTx = queryRunner.manager.create(Transaction, {
        wallet: recipientLocked,
        amount: amount,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.SUCCESS,
        reference: `TRF-${Date.now()}--${crypto.randomBytes(4).toString('hex')}-CR`,
        metadata: { type: 'credit', sender_wallet: senderLocked.id },
      });

      await queryRunner.manager.save([debitTx, creditTx]);

      await queryRunner.commitTransaction();
      return { status: 'success', message: 'Transfer completed' };
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(user: User): Promise<WalletBalanceResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) return { balance: 0 };
    return { balance: wallet.balance };
  }

  async getTransactions(user: User): Promise<TransactionHistoryResponse[]> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['transactions'],
    });
    if (!wallet) return [];
    return wallet.transactions.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime(),
    );
  }

  async getDepositStatus(reference: string): Promise<DepositStatusResponse> {
    const transaction = await this.transactionRepository.findOne({
      where: { reference },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
    };
  }
}
