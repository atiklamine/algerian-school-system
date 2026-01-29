import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/auth.utils';
import { sendResponse } from '../shared/response.utils';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any; // Replace 'any' with specific type if possible
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendResponse(res, 401, false, undefined, 'Access denied. No token provided.');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        return sendResponse(res, 401, false, undefined, 'Invalid token.');
    }
};
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return sendResponse(res, 403, false, undefined, 'Access denied. Insufficient permissions.');
        }
        next();
    };
};
