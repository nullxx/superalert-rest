import * as controller from '../controllers/register.controller';

import { Router } from 'express';
import { applyValidation } from '../validations/index.validation';
import registerValidation from '../validations/register.validation';

export const registerRouter = Router();

registerRouter
    .route('/')
    .post(
        ...registerValidation,
        applyValidation,
        controller.register,
    );
