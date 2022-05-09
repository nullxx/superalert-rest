import { NextFunction, Response } from "express";

import { RequestWithUser } from "../interfaces/RequestWithUser";
import { User } from "../interfaces/User";
import { connection } from "../config/database";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

const users = connection.get("users");

export const injectUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<unknown> => {
    try {
        const authorization = req.headers.authorization;
        const queryBearerToken = req.query.bearerToken;

        if (!authorization && !queryBearerToken)
            return res.status(httpStatus.UNAUTHORIZED).json({
                code: 0,
                message: "Provide a bearer token on the authorization header or query string 'bearerToken'",
            });

        const bearer = authorization?.split("Bearer ")[1] || queryBearerToken.toString();
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
