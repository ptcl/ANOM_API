import { Request, Response, NextFunction } from 'express';
import { formatForUser } from '../utils';

const AUTHORIZED_ROLES = ['FOUNDER'] as const;
type AuthorizedRole = typeof AUTHORIZED_ROLES[number];

export const AccessMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        const userRole = req.user.protocol?.role;

        if (!userRole || typeof userRole !== 'string') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - No valid role'
            });
        }

        const normalizedRole = userRole.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().toUpperCase();

        if (!AUTHORIZED_ROLES.includes(normalizedRole as AuthorizedRole)) {
            console.warn('Unauthorized access attempt:', {
                timestamp: formatForUser(),
                agentId: req.user.agentId,
                attemptedRole: userRole,
                normalizedRole: normalizedRole,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return res.status(403).json({
                success: false,
                error: 'Forbidden - Insufficient privileges'
            });
        }

        return next();

    } catch (error: any) {
        console.error('Access middleware system error:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};