import { Request, Response, NextFunction } from 'express';
import { Agent } from '../models/agent.model';

export const ActiveAgentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const agentId = (req as any).user?.agentId;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const agent = await Agent.findById(agentId).select('isActive deactivatedAt');

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        if (agent.isActive === false) {
            return res.status(403).json({
                success: false,
                error: 'Account deactivated',
                message: 'Votre compte a été désactivé. Contactez un administrateur.',
                deactivatedAt: agent.deactivatedAt
            });
        }

        next();
        return;
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
