import * as controller from "../controllers/pushNotification.controller";

import {
    deletePushNotification as deletePushNotificationValidation,
    getPushNotification as getPushNotificationValidation,
    sendPushNotification as sendPushNotificationValidation,
    answerPrompt as answerPromptValidation,
} from "../validations/pushNotification.validation";

import { Router } from "express";
import { applyValidation } from "../validations/index.validation";
import { injectUser, injectUserSoft } from '../middlewares/auth.middleware';

export const pushNotificationRouter = Router();

pushNotificationRouter
    .route("/")
    .get(
        injectUser,
        ...getPushNotificationValidation,
        applyValidation,
        controller.getNotifications,
    )
    .post(
        injectUserSoft,
        ...sendPushNotificationValidation,
        applyValidation,
        controller.sendNotification,
    );

pushNotificationRouter
    .route("/:notification")
    .put(
        injectUser,
        ...answerPromptValidation,
        applyValidation,
        controller.answerPrompt,
    );

pushNotificationRouter
    .route("/delete")
    .post(
        injectUser,
        ...deletePushNotificationValidation,
        applyValidation,
        controller.deleteNotification,
    );
