import { Request, Response } from 'express';

export const index = async (_req: Request, res: Response): Promise<void> => {
    res.send('OK');
};
