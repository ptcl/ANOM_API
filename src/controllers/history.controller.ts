import { Request, Response } from 'express';
import { getAgentHistory, getAgentHistoryCount } from '../services/history.service';

export const getMyHistory = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;
        if (!agentId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const skip = parseInt(req.query.skip as string) || 0;

        const history = await getAgentHistory(agentId, { limit, skip, isFounder: false });
        const total = await getAgentHistoryCount(agentId, false);

        return res.json({
            success: true,
            data: history,
            pagination: {
                total,
                limit,
                skip,
                hasMore: skip + limit < total
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
        });
    }
};

export const getAgentHistoryByFounder = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        if (!agentId) {
            return res.status(400).json({ success: false, error: 'Agent ID required' });
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
        const skip = parseInt(req.query.skip as string) || 0;

        const history = await getAgentHistory(agentId, { limit, skip, isFounder: true });
        const total = await getAgentHistoryCount(agentId, true);

        return res.json({
            success: true,
            data: history,
            pagination: {
                total,
                limit,
                skip,
                hasMore: skip + limit < total
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch agent history'
        });
    }
};
