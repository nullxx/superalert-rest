import { body } from 'express-validator';

export default [
    body('email').isEmail().normalizeEmail(),
    body('password').isString(),
];
