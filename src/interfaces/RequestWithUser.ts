import { Request } from 'express';
import { User } from './User';

export interface RequestWithUser extends Request {
    user: User;
}
