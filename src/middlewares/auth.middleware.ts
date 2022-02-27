import { NextFunction, Response } from 'express';

import { RequestWithUser } from '../interfaces/RequestWithUser';
import { User } from '../interfaces/User';
import { connection } from '../config/database';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

const users = connection.get('users');

export const injectUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<unknown> => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) return res
            .status(httpStatus.UNAUTHORIZED)
            .json({ code: 0, msg: 'Provide token and the authorization header' });

        const bearer = authorization.split('Bearer ')[1];
        if (!bearer) return res.status(httpStatus.UNAUTHORIZED)
            .json({ code: 0, msg: 'Auth not valid' });

        const decoded = jwt.verify(bearer, process.env.SECRET) as User;
        if (!decoded.email) return res
            .status(httpStatus.UNAUTHORIZED)
            .json({ code: 0, msg: 'Email not found in decoded token auth' });

        const user = await users.findOne({ email: decoded.email });
        if (!user) return res
            .status(httpStatus.UNAUTHORIZED)
            .json({ code: 0, msg: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
