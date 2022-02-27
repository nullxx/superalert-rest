import { body, param, query } from 'express-validator';

const sendPushNotification = [
    body('title').isString(),
    body('body').isString(),
    body('category').isString(),
    body('type').isString().optional().default('info').custom((input) => {
        const types = ['info', 'prompt'];
        if (types.includes(input)) return true;
        throw new Error(`Invalid value. Available types: ${types.join(', ')}`);
    }),
    body('risk').isString().optional().default('success').custom((input) => {
        const risks = ['success', 'warning', 'danger'];
        if (risks.includes(input)) return true;
        throw new Error(`Invalid value. Available risks: ${risks.join(', ')}`);
    }),
    body('webhookURL').isString().optional(),
];

const getPushNotification = [
    query('page').isNumeric(),
];

const deletePushNotification = [
    body('notificationId').isMongoId(),
];

const answerPrompt = [
    body('answer').isString(),
    param('notification').isMongoId(),
];

export { sendPushNotification, getPushNotification, deletePushNotification, answerPrompt };
