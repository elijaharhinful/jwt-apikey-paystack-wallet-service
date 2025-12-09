import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  AuthDocs,
  GoogleAuthDocs,
  GoogleCallbackDocs,
} from './docs/auth.swagger';
import type { Request } from 'express';
import type { RequestWithGoogleUser } from './interfaces/request-with-user.interface';

@Controller('auth')
@AuthDocs()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @GoogleAuthDocs()
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @GoogleCallbackDocs()
  googleAuthRedirect(@Req() req: RequestWithGoogleUser) {
    // req.user contains the user and jwt token from GoogleStrategy
    return req.user;
  }
}
