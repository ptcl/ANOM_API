import { Request, Response } from 'express';
import { rewardCodeService } from '../services/rewardCode.service';
import { logger } from '../utils';

export const generateRewardCodes = async (req: Request, res: Response): Promise<any> => {
    try {
        const creatorId = req.user?.bungieId || req.user?.agentId || 'unknown';

        const result = await rewardCodeService.generateCodes(req.body, creatorId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error: any) {
        logger.error('Error generating reward codes:', {
            error: error.message,
            creatorId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to generate codes' });
    }
};

export const getAllRewardCodes = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await rewardCodeService.getAllCodes(req.query as any);
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error fetching reward codes:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to fetch codes' });
    }
};

export const getRewardCodeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await rewardCodeService.getCodeById(req.params.codeId);

        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error fetching reward code:', {
            error: error.message,
            codeId: req.params.codeId,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to fetch code' });
    }
};

export const deleteRewardCode = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await rewardCodeService.deleteCode(req.params.codeId);

        if (!result.success) {
            return res.status(result.notFound ? 404 : 400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error deleting reward code:', {
            error: error.message,
            codeId: req.params.codeId,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to delete code' });
    }
};

export const redeemRewardCode = async (req: Request, res: Response): Promise<any> => {
    try {
        const agentId = req.user?.bungieId;
        const { code } = req.body;

        if (!agentId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!code) {
            return res.status(400).json({ success: false, error: 'Code is required' });
        }

        const result = await rewardCodeService.redeemCode(code, agentId);

        if (!result.success) {
            const status = result.invalidCode || result.notFound ? 404 :
                result.expired || result.alreadyUsed || result.maxUsesReached || result.alreadyUsedByYou ? 400 :
                    400;
            return res.status(status).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error redeeming reward code:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to redeem code' });
    }
};

export const getRewardCodeStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await rewardCodeService.getStats();
        return res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error fetching reward code stats:', {
            error: error.message,
            agentId: req.user?.agentId
        });
        return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};
