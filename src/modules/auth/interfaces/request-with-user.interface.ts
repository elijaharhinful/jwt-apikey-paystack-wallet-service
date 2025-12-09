import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithGoogleUser extends Request {
  user: {
    user: User;
    jwt: string;
  };
}
