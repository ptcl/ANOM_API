import { Request, Response, NextFunction } from 'express';

// Liste blanche des rôles autorisés
const AUTHORIZED_ROLES = ['FOUNDER'] as const;
type AuthorizedRole = typeof AUTHORIZED_ROLES[number];

export const AccessMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Vérification de l'authentification
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        // Validation robuste du rôle
        const userRole = req.user.protocol?.role;
        
        if (!userRole || typeof userRole !== 'string') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }

        // Vérification sécurisée du rôle avec liste blanche
        const normalizedRole = userRole.trim().toUpperCase() as AuthorizedRole;
        
        if (!AUTHORIZED_ROLES.includes(normalizedRole as any)) {
            // Log sécurisé de la tentative d'accès non autorisée
            console.warn('Unauthorized access attempt:', {
                timestamp: new Date().toISOString(),
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
        // Log sécurisé sans exposer d'informations sensibles
        console.error('Access middleware system error:', {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};