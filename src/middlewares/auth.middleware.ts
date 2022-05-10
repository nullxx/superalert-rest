import { NextFunction, Response } from "express";

import { RequestWithUser } from "../interfaces/RequestWithUser";
import { User } from "../interfaces/User";
import { connection } from "../config/database";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { promises as dns } from "dns";
import isValidHostname from "is-valid-hostname";

const users = connection.get("users");
const keys = connection.get("keys");

export const injectUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<unknown> => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization)
            return res.status(httpStatus.UNAUTHORIZED).json({
                code: 0,
                message:
                    "Provide a bearer token on the authorization header and query string 'key'",
            });

        const bearer = authorization?.split("Bearer ")[1];
        if (!bearer)
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ code: 0, message: "Auth not valid" });

        const decoded = jwt.verify(bearer, process.env.SECRET) as User;
        if (!decoded.email)
            return res.status(httpStatus.UNAUTHORIZED).json({
                code: 0,
                message: "Email not found in decoded token auth",
            });

        const user = await users.findOne({ email: decoded.email });
        if (!user)
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ code: 0, message: "User not found" });
        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

export const injectUserSoft = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<unknown> => {
    try {
        const key = req.query.key;

        if (!key)
            return res.status(httpStatus.UNAUTHORIZED).json({
                code: 0,
                message:
                    "Provide a query string 'key'",
            });

        const storedKey = await keys.findOne({ key });
        if (!storedKey)
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ code: 0, message: "Key not found" });
        req.key = storedKey;

        const user = await users.findOne({ _id: storedKey.user });
        if (!user)
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ code: 0, message: "User not found" });
        req.user = user;

        // validate storedKey.allowedOrigins that can be domains or ipv4
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        if (!ip || storedKey.allowedOrigins?.length === 0) return next();
        // resolve allowedOrigins (domains)
        storedKey.allowedOrigins = storedKey.allowedOrigins.filter(
            (origin: string) => isValidHostname(origin),
        );

        storedKey.allowedOrigins = storedKey.allowedOrigins.map(
            async (origin: string) => {
                const r = await dns.lookup(origin);
                return r.address;
            },
        );

        storedKey.allowedOrigins = await Promise.all(storedKey.allowedOrigins);
        if (!storedKey.allowedOrigins.includes(ip))
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ code: 0, message: "Origin not allowed" });

        next();
    } catch (error) {
        next(error);
    }
};
