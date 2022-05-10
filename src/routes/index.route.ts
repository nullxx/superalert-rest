import * as controller from '../controllers/index.controller';

import { Router } from 'express';
import { loginRouter } from './login.route';
import { pushNotificationRouter } from './pushNotification.route';
import { pushTokenRouter } from './pushToken.route';
import { registerRouter } from './register.route';
import { keysRouter } from './key.route';

export const index = Router();

index.get('/', controller.index);
index.use('/login', loginRouter);
index.use('/register', registerRouter);
index.use('/token', pushTokenRouter);
index.use('/notification', pushNotificationRouter);
index.use('/key', keysRouter);
