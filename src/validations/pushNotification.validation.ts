import { body, query } from 'express-validator';

const sendPushNotification = [
    body('title').isString(),
    body('body').isString(),
    body('category').isString(),
    body('risk').isString().optional().default('success').custom((input, meta) => {
        const risks = ['success', 'warning', 'danger'];
        if (risks.includes(input)) return true;
        throw new Error(`Invalid value. Available risks: ${risks.join(', ')}`);
    }),
];

const getPushNotification = [
    query('page').isNumeric(),
];

const deletePushNotification = [
    body('notificationId').isMongoId(),
];

export { sendPushNotification, getPushNotification, deletePushNotification };
