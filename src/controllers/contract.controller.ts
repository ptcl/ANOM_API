import { Request, Response } from 'express';
import { Agent } from '../models/agent.model';
import { generateUniqueId } from '../utils/generate';
import { ContractModel } from '../models/contract.model';
import { EmblemModel } from '../models/emblem.model';
import { checkContractAccess } from '../utils/contract';
import { IContract, IEmblem, IContributor } from '../types/contract';
import { IEmblem as IEmblemGlobal } from '../types/emblem';
import { formatForUser } from '../utils';

const VALID_CONTRACT_STATUSES: IContract['status'][] = ['pending', 'validated', 'cancelled', 'revoked'];

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_EMBLEM_CODE_LENGTH = 9;
const MAX_LEGEND_LENGTH = 200;
const MAX_CODES_PER_CONTRACT = 100;

export const createContract = async (req: Request, res: Response) => {
    try {
        const { emblems, contributors, validationDeadline, media } = req.body;

        if (!Array.isArray(contributors) || contributors.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required contributor information'
            });
        }

        for (const c of contributors) {
            if (!c.bungieId || !c.displayName) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid contributor data'
                });
            }
        }


        if (!Array.isArray(emblems) || emblems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one emblem is required'
            });
        }

        if (emblems.length > MAX_CODES_PER_CONTRACT) {
            return res.status(400).json({
                success: false,
                error: `Too many emblems (max ${MAX_CODES_PER_CONTRACT})`
            });
        }

        let parsedDeadline = null;
        if (validationDeadline) {
            parsedDeadline = new Date(validationDeadline);
            if (isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid validation deadline'
                });
            }
        }

        const contributorAgents = await Agent.find({
            bungieId: { $in: contributors.map((c: any) => c.bungieId.toString()) }
        });

        if (contributorAgents.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No valid agents found for contributors'
            });
        }

        const sanitizedEmblems: IEmblem[] = emblems.map((emblem: any) => {
            if (!emblem.name || !emblem.code) {
                throw new Error('Invalid emblem data');
            }

            if (typeof emblem.name !== 'string' || emblem.name.length === 0 || emblem.name.length > MAX_TITLE_LENGTH) {
                throw new Error('Invalid emblem name');
            }

            const codeWithoutDashes = emblem.code.replace(/-/g, '');
            if (typeof emblem.code !== 'string' || emblem.code.length === 0 || codeWithoutDashes.length > MAX_EMBLEM_CODE_LENGTH) {
                throw new Error('Invalid emblem code');
            }

            return {
                emblemId: generateUniqueId('EMBLEM'),
                name: emblem.name,
                code: emblem.code,
                status: 'available' as const
            };
        });

        const sanitizedContributors: IContributor[] = contributors.map((c: any) => ({
            bungieId: c.bungieId.toString(),
            displayName: c.displayName.toString().substring(0, MAX_TITLE_LENGTH),
            isAnonymous: !!c.isAnonymous
        }));

        const sanitizedMedia = Array.isArray(media)
            ? media.filter((m: any) => m.url && typeof m.url === 'string')
                .slice(0, sanitizedEmblems.length)
                .map((m: any) => ({
                    url: m.url,
                    legend: m.legend ? m.legend.toString().trim().substring(0, MAX_LEGEND_LENGTH) : undefined
                }))
            : [];

        const contractData: Partial<IContract> = {
            contractId: generateUniqueId('CONT'),
            contributors: sanitizedContributors,
            emblems: sanitizedEmblems,
            totalCodes: sanitizedEmblems.length,
            availableCodes: sanitizedEmblems.length,
            validationDeadline: parsedDeadline || undefined,
            media: sanitizedMedia,
            status: 'pending',
            isExpired: false,
            isSigned: false,
            revocationRequests: [],
            contractDate: new Date()
        };

        const newContract = await ContractModel.create(contractData);

        const emblemCreationPromises = sanitizedEmblems.map(async (emblem) => {
            try {
                const existingEmblem = await EmblemModel.findOne({ code: emblem.code });

                if (!existingEmblem) {
                    const emblemData: Partial<IEmblemGlobal> = {
                        emblemId: emblem.emblemId,
                        name: emblem.name,
                        code: emblem.code,
                        status: 'unavailable',
                        image: '',
                        description: `Emblème provenant du contrat ${newContract.contractId}`,
                    };

                    await EmblemModel.create(emblemData);

                } else {
                    console.log('Emblème déjà existant:', {
                        code: emblem.code,
                        existingEmblemId: existingEmblem.emblemId,
                        timestamp: formatForUser()
                    });
                }
            } catch (emblemError: any) {
                console.error('Erreur lors de la création de l\'emblème:', {
                    emblemCode: emblem.code,
                    error: emblemError.message,
                    timestamp: formatForUser()
                });
            }
        });

        await Promise.all(emblemCreationPromises);

        for (const contributorAgent of contributorAgents) {
            contributorAgent.contracts.push({
                contractMongoId: newContract._id,
                contractId: newContract.contractId,
                createdAs: "donor",
                linkedAt: new Date(),
                statusSnapshot: newContract.status,
                lastSyncedAt: new Date()
            });
            await contributorAgent.save();
        }

        return res.status(201).json({
            success: true,
            data: {
                contract: newContract
            },
            message: 'Contract created successfully'
        });
    } catch (error: any) {
        console.error('Contract creation error:', {
            timestamp: formatForUser(),
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
        const userRole = req.user?.protocol?.role;

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

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({
                success: false,
                error: error || 'Access denied'
            });
        }
        await contract.deleteOne();
        await Agent.updateMany(
            { "contracts.contractId": contractId },
            { $pull: { contracts: { contractId: contractId } } }
        );

        return res.json({
            success: true,
            message: 'Contract deleted successfully'
        });
    } catch (error: any) {
        console.error('Contract deletion error:', {
            timestamp: formatForUser(),
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
        const { status, validationDeadline, media, isExpired, isSigned } = req.body;
        const userBungieId = req.user?.bungieId;
        const userRole = req.user?.protocol?.role;

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

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({
                success: false,
                error: error || 'Access denied'
            });
        }

        const updateData: Partial<IContract> = {
            updatedAt: new Date()
        };

        if (status !== undefined && VALID_CONTRACT_STATUSES.includes(status)) {
            updateData.status = status;
        }

        if (validationDeadline !== undefined) {
            if (validationDeadline === null) {
                updateData.validationDeadline = undefined;
            } else {
                const parsedDeadline = new Date(validationDeadline);
                if (!isNaN(parsedDeadline.getTime()) && parsedDeadline > new Date()) {
                    updateData.validationDeadline = parsedDeadline;
                }
            }
        }

        if (media !== undefined && Array.isArray(media)) {
            const maxMedia = contract.emblems?.length || MAX_CODES_PER_CONTRACT;
            updateData.media = media.filter((m: any) => m.url && typeof m.url === 'string')
                .slice(0, maxMedia)
                .map((m: any) => ({
                    url: m.url,
                    legend: m.legend ? m.legend.toString().trim().substring(0, MAX_LEGEND_LENGTH) : undefined
                }));
        }

        if (isExpired !== undefined) {
            updateData.isExpired = !!isExpired;
        }

        if (isSigned !== undefined) {
            updateData.isSigned = !!isSigned;
        }

        const updatedContract = await ContractModel.findOneAndUpdate(
            { contractId },
            { $set: updateData },
            { new: true }
        );

        if (updatedContract) {
            await Agent.updateMany(
                { "contracts.contractMongoId": updatedContract._id },
                {
                    $set: {
                        "contracts.$.statusSnapshot": updatedContract.status,
                        "contracts.$.lastSyncedAt": new Date()
                    }
                }
            );
        }
        if (!updatedContract) {
            return res.status(404).json({
                success: false,
                error: 'Contract not found'
            });
        }

        return res.json({
            success: true,
            data: {
                contract: updatedContract
            },
            message: 'Contract updated successfully'
        });
    } catch (error: any) {
        console.error('Contract update error:', {
            timestamp: formatForUser(),
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

        const agent = await Agent.findOne({ bungieId: userBungieId });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        const contractMongoIds = agent.contracts.map((c: any) => c.contractMongoId).filter(Boolean);

        const contracts = await ContractModel.find({ _id: { $in: contractMongoIds } }).sort({ createdAt: -1 });

        const stats = {
            totalContracts: contracts.length,
            totalContractsPending: contracts.filter(c => c.status === 'pending').length,
            totalContractsValidated: contracts.filter(c => c.status === 'validated').length,
            totalContractsCancelled: contracts.filter(c => c.status === 'cancelled').length,
            totalContractsRevoked: contracts.filter(c => c.status === 'revoked').length,
            totalEmblems: contracts.reduce((sum, c) => sum + (c.totalCodes || 0), 0),
            totalEmblemsAvailable: contracts.reduce((sum, c) => sum + (c.availableCodes || 0), 0),
            totalEmblemsRedeemed: contracts.reduce((sum, c) => sum + ((c.totalCodes || 0) - (c.availableCodes || 0)), 0)
        };

        return res.json({
            success: true,
            data: {
                contracts,
                stats,
                count: contracts.length
            },
            message: 'Agent contracts retrieved successfully'
        });
    } catch (error: any) {
        console.error('Agent contracts fetch error:', {
            timestamp: formatForUser(),
            requesterId: req.user?.agentId,
            ip: req.ip,
            error: error.message,
            stack: error.stack
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
        const userRole = req.user?.protocol?.role;

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

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({
                success: false,
                error: error || 'Access denied'
            });
        }

        return res.json({
            success: true,
            data: {
                contract
            },
            message: 'Contract retrieved successfully'
        });
    } catch (error: any) {
        console.error('Contract fetch error:', {
            timestamp: formatForUser(),
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
        const contracts = await ContractModel.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: {
                contracts,
                count: contracts.length
            },
            message: 'All contracts retrieved successfully'
        });
    } catch (error: any) {
        console.error('All contracts fetch error:', {
            timestamp: formatForUser(),
            requesterId: req.user?.agentId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};