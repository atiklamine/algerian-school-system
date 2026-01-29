import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendResponse } from '../shared/response.utils';

export const validate = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            console.error('Validation error:', error.flatten());
            const flattened = error.flatten();
            const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;

            // Convert field errors object to array of strings
            const errorMessages: string[] = [];
            for (const key in fieldErrors) {
                const messages = fieldErrors[key];
                if (messages && messages.length > 0) {
                    errorMessages.push(`${key}: ${messages.join(', ')}`);
                }
            }
            return sendResponse(res, 400, false, undefined, 'Validation failed', errorMessages);
        }
        return next(error);
    }
};
