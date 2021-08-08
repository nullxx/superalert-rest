import * as controller from '../controllers/login.controller';

import { Router } from 'express';
import { applyValidation } from '../validations/index.validation';
import loginValidation from '../validations/login.validation';

const loginRouter = Router();

loginRouter
    .route('/')
    .post(
        ...loginValidation,
        applyValidation,
        controller.login,
    );
export { loginRouter };
