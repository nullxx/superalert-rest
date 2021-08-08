import { NextFunction, Response } from 'express';

import Logger from '../lib/logger';
import { RequestWithUser } from '../interfaces/RequestWithUser';
import admin from '../lib/firebase';
import { connection } from '../config/database';
import httpStatus from 'http-status';

const pushtokens = connection.get('pushtokens');
const notifications = connection.get('notifications');
const logger = Logger('debug', __filename);

const paginate = 100;

async function sendNotification(req: RequestWithUser, res: Response, next: NextFunction): Promise<unknown> {
    try {
        const { title, body, category, risk = 'success' } = req.body;

        const tokensArr = await pushtokens.find({ user: req.user._id });
        if (tokensArr.length === 0)
            return res.status(httpStatus.EXPECTATION_FAILED).json({ code: 0, msg: 'Not push token registered' });

        await notifications.insert({
            title, body, createdAt: new Date(), category, risk, user: req.user._id,
        }); // more important to save than pushing notification

        const tokens = tokensArr.map(({ token }) => token);

        const pushSendResponse = await admin.messaging().sendMulticast({
            tokens,
            notification: {
                title,
                body,
            },
            data: {
                category,
                risk,
            },
        });

        const errors = [];
        if (pushSendResponse.failureCount > 0) {
            for (const [i, pResponse] of pushSendResponse.responses.entries()) {
                if (pResponse.success) continue;

                logger.debug('pResponse.error', pResponse.error);
                switch (pResponse.error.code) {
                    case 'messaging/invalid-registration-token':
                    case 'messaging/registration-token-not-registered':
                    case 'messaging/invalid-argument':
                        const token = tokens[i];
                        logger.debug('Deleting token', token);
                        await pushtokens.remove({ token });
                        break;
                    default:
                        errors.push(pResponse.error.message);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        res.json({ code: 1, msg: 'OK' });
    } catch (error) {
        next(error);
    }
}

async function getNotifications(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
        const page = Math.max(0, req.query['page'] as unknown as number);

        const notificationsArr = await notifications.find({
            user: req.user._id,
        }, {
            skip: page * paginate,
            limit: paginate,
            sort: [['createdAt', 1]],
        });

        const nextPage = await notifications.find({
            user: req.user._id,
        }, {
            skip: (page + 1) * paginate,
            limit: paginate,
            sort: [['createdAt', 1]],
        });

        res.json({ code: 1, data: notificationsArr, hasNextPage: nextPage.length > 1 });
    } catch (error) {
        next(error);
    }
}

async function deleteNotification(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
        const { notificationId } = req.body;

        const resp = await notifications.remove({ $and: [{ _id: { $in: [notificationId] } }, { user: req.user._id }] });

        if (resp.deletedCount > 0) {
            res.json({ code: 1, data: 'OK' });
        } else {
            res.json({ code: 0, data: 'No notification matched' });
        }
    } catch (error) {
        next(error);
    }
}

export { sendNotification, getNotifications, deleteNotification };
