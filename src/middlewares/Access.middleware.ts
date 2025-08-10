import { Request, Response, NextFunction } from 'express';


export const AccessMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        if (req.user.protocol?.role?.toUpperCase() !== 'FOUNDER') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Founder privileges required'
            });
        }

        return next();
    } catch (error: any) {
        console.error('❌ Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authorization failed',
            message: error.message
        });
    }
};