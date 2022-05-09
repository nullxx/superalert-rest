import { NextFunction, Response } from "express";

import Logger from "../lib/logger";
import { RequestWithUser } from "../interfaces/RequestWithUser";
import admin from "../lib/firebase";
import { connection } from "../config/database";
import httpStatus from "http-status";
import axios from "axios";

const pushtokens = connection.get("pushtokens");
const notifications = connection.get("notifications");
const logger = Logger("debug", __filename);

async function sendNotification(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<unknown> {
    try {
        const { title, body, category, risk, type, webhookURL } = req.body;

        const tokens = await pushtokens.distinct("token", { user: req.user._id });
        if (tokens.length === 0)
            return res
                .status(httpStatus.EXPECTATION_FAILED)
                .json({ code: 0, message: "Not push token registered" });

        const notification = await notifications.insert({
            title,
            body,
            createdAt: new Date(),
            category,
            risk,
            user: req.user._id,
            type,
            webhookURL,
        }); // more important to save than pushing notification

        const pushSendResponse = await admin.messaging().sendMulticast({
            tokens,
            notification: {
                title,
                body,
            },
            data: {
                notification: JSON.stringify(notification),
            },
        });

        const errors = [];
        if (pushSendResponse.failureCount > 0) {
            for (const [i, pResponse] of pushSendResponse.responses.entries()) {
                if (pResponse.success) continue;

                logger.debug("pResponse.error", pResponse.error);
                switch (pResponse.error.code) {
                    case "messaging/invalid-registration-token":
                    case "messaging/registration-token-not-registered":
                        const token = tokens[i];
                        logger.debug("Deleting token", token);
                        await pushtokens.remove({ token });
                        break;
                    default:
                        errors.push(pResponse.error.message);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }

        res.json({ code: 1, message: "OK", data: { notification } });
    } catch (error) {
        next(error);
    }
}

async function getNotifications(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const paginate = Number(req.query.paginate);

        const page = Math.max(
            0,
            req.query.page as unknown as number,
        );

        const totalNotis = await notifications.count({
            user: req.user._id,
        });

        // const page = Math.max(1, requestedPage + 1);

        const skip = Math.max(0, page * paginate);
        const limit = skip + paginate;

        const nextSkip = Math.max(0, (page + 1) * paginate);
        const hasNextPage = nextSkip < totalNotis;

        const notificationsArr = await notifications.find(
            {
                user: req.user._id,
            },
            {
                skip,
                limit,
                sort: { createdAt: -1 }, // page 0 is the last page
            },
        );

        res.json({
            code: 1,
            data: notificationsArr,
            hasNextPage,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteNotification(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { notificationId } = req.body;

        const resp = await notifications.remove({ _id: notificationId, user: req.user._id });

        if (resp.deletedCount > 0) {
            res.json({ code: 1, data: "OK" });
        } else {
            res.json({ code: 0, data: "No notification matched" });
        }
    } catch (error) {
        next(error);
    }
}

async function answerPrompt(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<unknown> {
    try {
        const { notification } = req.params;
        const { answer } = req.body;
        const notificationDoc = await notifications.findOneAndUpdate(
            { _id: notification, answer: null }, // only update if not answered
            { $set: { answer } },
        );

        if (!notificationDoc) {
            return res.json({
                code: 0,
                message: "No notification or already answered",
            });
        }

        if (notificationDoc.webhookURL) {
            axios
                .post(notificationDoc.webhookURL, {
                    answer,
                    notificationId: notificationDoc._id,
                })
                .catch(logger.error)
                .then(() =>
                    logger.debug(
                        "Weebhook send for notification",
                        notificationDoc._id,
                    ),
                );
        }

        res.json({ code: 1, data: notificationDoc });
    } catch (error) {
        next(error);
    }
}
export { sendNotification, getNotifications, deleteNotification, answerPrompt };
