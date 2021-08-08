import * as controller from '../controllers/pushNotification.controller';

import {
    deletePushNotification as deletePushNotificationValidation,
    getPushNotification as getPushNotificationValidation,
    sendPushNotification as sendPushNotificationValidation,
} from '../validations/pushNotification.validation';

import { Router } from 'express';
import { applyValidation } from '../validations/index.validation';
import { injectUser } from '../middlewares/auth.middleware';

export const pushNotificationRouter = Router();

pushNotificationRouter
    .route('/')
    .get(
        injectUser,
        ...getPushNotificationValidation,
        applyValidation,
        controller.getNotifications,
    )
    .post(
        injectUser,
        ...sendPushNotificationValidation,
        applyValidation,
        controller.sendNotification,
    );

pushNotificationRouter
    .route('/delete')
    .post(
        injectUser,
        ...deletePushNotificationValidation,
        applyValidation,
        controller.deleteNotification,
    );

