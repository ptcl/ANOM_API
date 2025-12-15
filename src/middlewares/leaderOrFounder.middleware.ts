import { Request, Response, NextFunction } from 'express';
import { Division } from '../models/division.model';
import { logger } from '../utils';

const FOUNDER_ROLE = 'FOUNDER';

export const LeaderOrFounderMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const roles = user.protocol?.roles || [];
        const isFounder = roles.some((role: any) => {
            const roleName = typeof role === 'string' ? role : role.roleName || role.name;
            return roleName?.toUpperCase() === FOUNDER_ROLE;
        });

        if (isFounder) {
            return next();
        }

        const { divisionId } = req.params;

        if (!divisionId) {
            return res.status(400).json({
                success: false,
                error: 'Division ID required'
            });
        }

        const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });

        if (!division) {
            return res.status(404).json({
                success: false,
                error: 'Division not found'
            });
        }

        const userBungieId = user.bungieId;
        const isLeader = division.leaderId === userBungieId;

        if (!isLeader) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: You must be a Founder or the leader of this division'
            });
        }

        (req as any).division = division;

        next();
    } catch (error: any) {
        logger.error('LeaderOrFounderMiddleware error', {
            error: error.message,
            userId: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
