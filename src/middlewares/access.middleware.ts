import { Request, Response, NextFunction } from 'express';
import { formatForUser } from '../utils';

// Liste blanche des rôles autorisés
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
                error: 'Forbidden'
            });
        }

        const normalizedRole = userRole.trim().toUpperCase() as AuthorizedRole;

        if (!AUTHORIZED_ROLES.includes(normalizedRole as any)) {
            console.warn('Unauthorized access attempt:', {
                timestamp: formatForUser(),
                agentId: req.user.agentId,
                attemptedRole: userRole,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }

        return next();
    } catch (error: any) {
        console.error('Access middleware system error:', {
            timestamp: formatForUser(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};