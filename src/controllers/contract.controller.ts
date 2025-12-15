import { Request, Response } from 'express';
import { contractService } from '../services/contract.service';
import { logger } from '../utils';

export const createContract = async (req: Request, res: Response) => {
    try {
        const result = await contractService.createContract(req.body, req.user);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error: any) {
        logger.error('Contract creation error:', {
            creatorId: req.user?.agentId,
            ip: req.ip,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
        const userRoles = req.user?.protocol?.roles;

        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        const result = await contractService.deleteContract(contractId, userBungieId, userRoles);

        if (!result.success) {
            return res.status(result.error === 'Contract not found' ? 404 : 403).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract deletion error:', {
            deleterId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const updateContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
        const userRoles = req.user?.protocol?.roles;

        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        const result = await contractService.updateContract(contractId, req.body, userBungieId, userRoles);

        if (!result.success) {
            return res.status(result.error === 'Contract not found' ? 404 : 403).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract update error:', {
            updaterId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAgentAllContracts = async (req: Request, res: Response) => {
    try {
        const userBungieId = req.user?.bungieId;

        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const result = await contractService.getAgentContracts(userBungieId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Agent contracts fetch error:', {
            requesterId: req.user?.agentId,
            ip: req.ip,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAgentContractsById = async (req: Request, res: Response) => {
    try {
        const agent = req.resolvedAgent!;

        const result = await contractService.getAgentContracts(agent._id!.toString());

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Agent contracts fetch error:', {
            requesterId: req.user?.agentId,
            targetAgentId: req.params.agentId,
            ip: req.ip,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getContractById = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
        const userRoles = req.user?.protocol?.roles;

        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        const result = await contractService.getContractById(contractId, userBungieId, userRoles);

        if (!result.success) {
            return res.status(403).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract fetch error:', {
            requesterId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAllContracts = async (req: Request, res: Response) => {
    try {
        const result = await contractService.getAllContracts();

        return res.json(result);
    } catch (error: any) {
        logger.error('All contracts fetch error:', {
            requesterId: req.user?.agentId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const validateContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;

        if (!contractId) {
            return res.status(400).json({
                success: false,
                error: 'Contract ID required'
            });
        }

        const result = await contractService.validateContract(contractId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract validation error:', {
            validatorId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const validateContractPartial = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const { emblemDecisions } = req.body;

        if (!contractId) {
            return res.status(400).json({
                success: false,
                error: 'Contract ID required'
            });
        }

        if (!Array.isArray(emblemDecisions) || emblemDecisions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Emblem decisions required (array of { emblemId, accepted })'
            });
        }

        const result = await contractService.validateContractPartial(contractId, emblemDecisions);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract partial validation error:', {
            validatorId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const revokeContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;

        if (!contractId) {
            return res.status(400).json({
                success: false,
                error: 'Contract ID required'
            });
        }

        const result = await contractService.revokeContract(contractId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract revocation error:', {
            revokerId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const unrevokeContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;

        if (!contractId) {
            return res.status(400).json({
                success: false,
                error: 'Contract ID required'
            });
        }

        const result = await contractService.unrevokeContract(contractId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);
    } catch (error: any) {
        logger.error('Contract unrevoke error:', {
            userId: req.user?.agentId,
            contractId: req.params.contractId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const cleanupExpiredEmblems = async (req: Request, res: Response) => {
    try {
        const result = await contractService.cleanupExpiredEmblems();

        return res.json(result);
    } catch (error: any) {
        logger.error('Emblem cleanup error:', {
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};