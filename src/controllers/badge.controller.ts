import { Request, Response } from 'express';
import { badgeService } from '../services/badge.service';
import { logger } from '../utils';

export const getAllBadges = async (req: Request, res: Response): Promise<any> => {
    try {
        const filters = (req as any).validated?.query || req.query;
        const result = await badgeService.getAllBadges(filters);
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error retrieving badges:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to retrieve badges' });
    }
};

export const getBadgeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await badgeService.getBadgeById(req.params.badgeId);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error retrieving badge:', {
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to retrieve badge' });
    }
};

export const createBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await badgeService.createBadge(req.body);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    } catch (error: any) {
        logger.error('Error creating badge:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to create badge' });
    }
};

export const updateBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await badgeService.updateBadge(req.params.badgeId, req.body);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error updating badge:', {
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to update badge' });
    }
};

export const deleteBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await badgeService.deleteBadge(req.params.badgeId);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error deleting badge:', {
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to delete badge' });
    }
};

export const getBadgeStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await badgeService.getBadgeStats();
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error retrieving badge stats:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to retrieve badge stats' });
    }
};

export const giftBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId, badgeId } = req.params;
        const result = await badgeService.giftBadge(badgeId, agentId);
        if (!result.success) {
            const status = result.notFound ? 404 : result.alreadyHas ? 409 : 400;
            return res.status(status).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error gifting badge:', {
            error: error.message,
            params: req.params,
            giftedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to gift badge' });
    }
};

export const revokeBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId, badgeId } = req.params;
        const result = await badgeService.revokeBadge(badgeId, agentId);
        if (!result.success) {
            const status = result.notFound ? 404 : result.notHasBadge ? 404 : 400;
            return res.status(status).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error revoking badge:', {
            error: error.message,
            params: req.params,
            revokedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to revoke badge' });
    }
};

export const giftBadgeBatch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId } = req.params;
        const { agentIds } = req.body;

        if (!Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'agentIds array is required'
            });
        }

        const result = await badgeService.giftBadgeBatch(badgeId, agentIds);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error batch gifting badge:', {
            error: error.message,
            badgeId: req.params.badgeId,
            giftedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to batch gift badge' });
    }
};

export const revokeBadgeBatch = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId } = req.params;
        const { agentIds } = req.body;

        if (!Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'agentIds array is required'
            });
        }

        const result = await badgeService.revokeBadgeBatch(badgeId, agentIds);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error batch revoking badge:', {
            error: error.message,
            badgeId: req.params.badgeId,
            revokedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to batch revoke badge' });
    }
};

export const giftBadgesToAgent = async (req: Request, res: Response): Promise<any> => {
    try {
        const agent = req.resolvedAgent!;
        const { badgeIds } = req.body;

        const result = await badgeService.giftBadgesToAgent(agent._id!.toString(), badgeIds);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error gifting badges to agent:', {
            error: error.message,
            agentId: req.params.agentId,
            giftedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to gift badges to agent' });
    }
};

export const revokeBadgesFromAgent = async (req: Request, res: Response): Promise<any> => {
    try {
        const agent = req.resolvedAgent!;
        const { badgeIds } = req.body;

        const result = await badgeService.revokeBadgesFromAgent(agent._id!.toString(), badgeIds);
        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error revoking badges from agent:', {
            error: error.message,
            agentId: req.params.agentId,
            revokedBy: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to revoke badges from agent' });
    }
};