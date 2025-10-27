import { Request, Response, NextFunction } from 'express';
import { formatForUser } from '../utils';

const AUTHORIZED_ROLES = ['FOUNDER'] as const;
type AuthorizedRole = typeof AUTHORIZED_ROLES[number];

export const AccessMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No user context',
            });
        }

        const rawRoles =
            user.roles ||
            user.protocol?.roles ||
            user.userRoles ||
            [];

        if (!Array.isArray(rawRoles) || rawRoles.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - No valid roles found',
            });
        }

        const normalizedRoles = rawRoles
            .filter(Boolean)
            .map((role: string) =>
                role.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().toUpperCase()
            );

        const hasAccess = normalizedRoles.some((role) =>
            AUTHORIZED_ROLES.includes(role as AuthorizedRole)
        );

        if (!hasAccess) {
            console.warn('🚫 Unauthorized access attempt:', {
                timestamp: formatForUser(),
                agentId: user.agentId,
                attemptedRoles: rawRoles,
                normalizedRoles,
                required: AUTHORIZED_ROLES,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });

            return res.status(403).json({
                success: false,
                error: 'Forbidden - Insufficient privileges',
            });
        }

        return next();
    } catch (error: any) {
        console.error('❌ Access middleware system error:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
