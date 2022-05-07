import { NextFunction, Request, Response } from "express";

import { connection } from "../config/database";
import { hash } from "../lib/crypto";
import jwt from "jsonwebtoken";

const users = connection.get("users");

async function register(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<unknown> {
    try {
        const { email, password } = req.body;

        const userFound = await users.findOne({ email: email });
        if (userFound)
            return res.json({ code: 0, message: "User already exists" });

        const hashedPassword = await hash(password);
        await users.insert({
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        res.json({
            code: 1,
            message: "User created with success",
            data: { token: jwt.sign({ email }, process.env.SECRET) },
        });
    } catch (error) {
        next(error);
    }
}

export { register };
