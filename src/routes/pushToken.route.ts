import * as controller from '../controllers/pushToken.controller';

import { Router } from 'express';
import { applyValidation } from '../validations/index.validation';
import { injectUser } from '../middlewares/auth.middleware';
import pushTokenValidation from '../validations/pushToken.validation';

export const pushTokenRouter = Router();

pushTokenRouter
    .route('/')
    .post(
        injectUser,
        ...pushTokenValidation,
        applyValidation,
        controller.updateToken,
    );
