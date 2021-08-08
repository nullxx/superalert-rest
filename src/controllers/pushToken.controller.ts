import { NextFunction, Response } from 'express';

import { RequestWithUser } from '../interfaces/RequestWithUser';
import { connection } from '../config/database';

const pushtokens = connection.get('pushtokens');

async function updateToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<unknown> {
    try {
        const { token } = req.body;

        const existsToken = await pushtokens.findOne({ user: req.user._id, token });
        if (existsToken) return res.json({ code: 1, msg: 'Token already exists' });

        await pushtokens.insert({ user: req.user._id, token });

        res.json({ code: 1, msg: 'success' });
    } catch (error) {
        next(error);
    }
}

export { updateToken };
