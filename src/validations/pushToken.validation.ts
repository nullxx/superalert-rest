import { body } from 'express-validator';

export default [
    body('token').isString(),
];
