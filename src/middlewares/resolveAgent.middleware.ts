import { Request, Response, NextFunction } from 'express';
import { findAgentByIdentifier } from '../utils/verifyAgent.helper';
import { IAgentDocument } from '../types/agent';

export const ResolveAgentMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const identifier = req.params.identifier || req.params.agentId || req.params.bungieId || req.body.identifier || req.body.agentId || req.body.leaderId || req.body.bungieId;

        if (!identifier) {
            res.status(400).json({
                success: false,
                error: 'Agent identifier is required (agentId, bungieId, or uniqueName)'
            });
            return;
        }

        const agent = await findAgentByIdentifier(identifier);

        if (!agent) {
            res.status(404).json({
                success: false,
                error: `Agent not found with identifier: ${identifier}`
            });
            return;
        }

        (req as any).resolvedAgent = agent;

        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Error resolving agent',
            details: error.message
        });
    }
};

export const ResolveAgentOptionalMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const identifier = req.params.identifier || req.params.agentId || req.params.bungieId || req.body.identifier || req.body.agentId || req.body.leaderId || req.body.bungieId;

        if (identifier) {
            const agent = await findAgentByIdentifier(identifier);
            if (agent) {
                (req as any).resolvedAgent = agent;
            }
        }

        next();
    } catch (error: any) {
        next();
    }
};

declare global {
    namespace Express {
        interface Request {
            resolvedAgent?: IAgentDocument;
        }
    }
}
