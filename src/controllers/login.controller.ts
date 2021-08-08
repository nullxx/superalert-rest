import { NextFunction, Request, Response } from 'express';

import { connection } from '../config/database';
import jwt from 'jsonwebtoken';
import { verify } from '../lib/crypto';

const users = connection.get('users');

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const {
            email, password,
        } = req.body;

        const userFound = await users.findOne({ email: email });
        const passwordCorrect = await verify(password, userFound.password);

        if (userFound && passwordCorrect) {
            res.json({ code: 1, data: { token: jwt.sign({ email: email }, process.env.SECRET) } });
        } else {
            res.json({ code: 0, msg: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
}

export { login };
