import { Response } from 'express';
import { ApiResponse } from './types';

export const sendResponse = <T>(res: Response, statusCode: number, success: boolean, data?: T, message?: string, errors?: string[]) => {
    const response: ApiResponse<T> = {
        success,
        data,
        message,
        errors,
        meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
        },
    };
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(statusCode).json(response);
};
