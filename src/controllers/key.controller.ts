import { Request, Response, NextFunction } from "express";
import { randomBytes } from "../lib/crypto";
import { connection } from "../config/database";
import { RequestWithUser } from '../interfaces/RequestWithUser';

const keysCollection = connection.get("keys");

export async function getKeys(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const keys = await keysCollection.find({});

        res.json({
            code: 1,
            data: keys,
        });
    } catch (error) {
        next(error);
    }
}

export async function createKey(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { description, allowedOrigins = [] } = req.body;

        const newKey = await keysCollection.insert({
            key: randomBytes(16),
            description,
            allowedOrigins,
            user: req.user._id,
            createdAt: new Date(),
        });

        res.json({
            code: 1,
            data: newKey,
        });
    } catch (error) {
        next(error);
    }
}
