import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Wallet } from '../modules/wallets/entities/wallet.entity';
import { ApiKey } from '../modules/api-keys/entities/api-key.entity';
import { Transaction } from '../modules/wallets/entities/transaction.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'paystack_wallet',
  entities: [User, Wallet, ApiKey, Transaction],
  synchronize: true,
};
