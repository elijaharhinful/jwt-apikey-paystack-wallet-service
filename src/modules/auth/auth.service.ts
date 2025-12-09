import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Profile } from 'passport-google-oauth20';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly walletsService: WalletsService,
  ) {}

  async validateOAuthLogin(profile: Profile): Promise<User> {
    try {
      const { emails, id } = profile;

      if (!emails || !emails.length) {
        throw new InternalServerErrorException('Email not provided by Google');
      }

      const email = emails[0].value;

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Create new user if not exists
        user = await this.usersService.create({
          email,
          google_id: id,
        });
        // Create Wallet
        await this.walletsService.create(user);
      } else if (!user.google_id) {
        // Link googleId if needed
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error validating OAuth login');
    }
  }

  async generateJwt(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}
