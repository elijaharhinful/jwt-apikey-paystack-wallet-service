import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaystackModule } from './modules/paystack/paystack.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { User } from './modules/users/entities/user.entity';
import { Wallet } from './modules/wallets/entities/wallet.entity';
import { ApiKey } from './modules/api-keys/entities/api-key.entity';
import { Transaction } from './modules/wallets/entities/transaction.entity';

import configuration from './config/configuration';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [User, Wallet, ApiKey, Transaction],
        synchronize: true, // Auto-create tables (disable in production)
      }),
    }),
    UsersModule,
    WalletsModule,
    AuthModule,
    PaystackModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
