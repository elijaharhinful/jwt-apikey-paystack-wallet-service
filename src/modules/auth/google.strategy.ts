import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('auth.google.clientId') || '',
      clientSecret: configService.get<string>('auth.google.clientSecret') || '',
      callbackURL: configService.get<string>('auth.google.callbackUrl') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const user = await this.authService.validateOAuthLogin(profile);
      const jwt = await this.authService.generateJwt(user);
      done(null, { user, jwt });
    } catch (err) {
      done(err, false);
    }
  }
}
