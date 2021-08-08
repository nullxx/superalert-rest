import { NextFunction, Request, Response } from 'express';

import Logger from '../lib/logger';

const logger = Logger('error', __filename);

declare type WebError = Error & { status?: number };

export const errorHandler = (err: WebError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error(err);

    let message;

    if (Array.isArray(err)) {
        message = err.map((error) => `${error.msg} in ${error.param}`).join(',');
    }

    res.locals.message = message || err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500).send({ title: err.name, message: res.locals.message });
};
