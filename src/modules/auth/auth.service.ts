import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallets/wallets.service';
import { User } from '../users/entities/user.entity';
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async validateOAuthLogin(profile: Profile): Promise<User> {
    const { emails, id } = profile;

    if (!emails || !emails.length) {
      throw new InternalServerErrorException('Email not provided by Google');
    }

    const email = emails[0].value;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create user and wallet atomically
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create user
        const userEntity = queryRunner.manager.create(User, {
          email,
          google_id: id,
        });
        user = await queryRunner.manager.save(userEntity);

        // Create wallet using existing service method
        const walletNumber =
          await this.walletsService.generateUniqueWalletNumber();
        const wallet = queryRunner.manager.create(
          this.walletsService.walletRepository.target,
          {
            user,
            balance: 0,
            wallet_number: walletNumber,
          },
        );
        await queryRunner.manager.save(wallet);

        await queryRunner.commitTransaction();
      } catch (err: unknown) {
        await queryRunner.rollbackTransaction();
        if (err instanceof Error) {
          throw new InternalServerErrorException(
            `Failed to create user and wallet: ${err.message}`,
          );
        } else {
          throw new InternalServerErrorException(
            'Failed to create user and wallet',
          );
        }
      } finally {
        await queryRunner.release();
      }
    } else if (!user.google_id) {
      // Link Google ID if user exists without it
      user.google_id = id;
      await this.usersService.update(user.id, { google_id: id });
    }

    return user;
  }

  async generateJwt(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}
