import { Request, Response } from 'express';
import { AgentModel } from '../models/agent.model';
import { generateUniqueId } from '../utils/generate';
import { ContractModel } from '../models/contract.model';
import { checkContractAccess } from '../utils/contract';
import { IContract, IEmblem, IContributor } from '../types/contract';

// Constantes de validation basées sur l'interface
const VALID_CONTRACT_STATUSES: IContract['status'][] = ['pending', 'validated', 'cancelled', 'revoked'];
const VALID_EMBLEM_STATUSES: IEmblem['status'][] = ['available', 'redeemed', 'revoked'];
const VALID_REVOCATION_STATUSES = ['pending', 'processed', 'cancelled'] as const;

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_EMBLEM_CODE_LENGTH = 9;
const MAX_LEGEND_LENGTH = 200;
const MAX_CODES_PER_CONTRACT = 100; // Limite max d'emblèmes = limite max de médias

export const createContract = async (req: Request, res: Response) => {
    try {
        const { emblems, contributor, validationDeadline, media } = req.body;
        const userRole = req.user?.protocol?.role;
        const isFounder = userRole === 'FOUNDER';
        const targetAgentId = isFounder ? req.body.agentId : req.user?.bungieId;

        // Validation des champs requis
        if (!contributor || !contributor.bungieId || !contributor.displayName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required contributor information'
            });
        }

        if (!targetAgentId) {
            return res.status(400).json({
                success: false,
                error: 'Target agent not specified'
            });
        }

        // Validation des emblems
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

        // Validation de la date limite
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

        // Vérifier que l'agent existe
        const agent = await AgentModel.findOne({ bungieId: targetAgentId });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        // Sanitiser et valider les emblems
        const sanitizedEmblems: IEmblem[] = emblems.map((emblem: any) => {
            if (!emblem.name || !emblem.code) {
                throw new Error('Invalid emblem data');
            }
            
            // Validation du nom (peut être nettoyé)
            if (typeof emblem.name !== 'string' || emblem.name.length === 0 || emblem.name.length > MAX_TITLE_LENGTH) {
                throw new Error('Invalid emblem name');
            }
            
            // Validation du code (STRICTE - pas de modification)
            if (typeof emblem.code !== 'string' || emblem.code.length === 0 || emblem.code.length > MAX_EMBLEM_CODE_LENGTH) {
                throw new Error('Invalid emblem code');
            }
            
            return {
                emblemId: generateUniqueId('EMBLEM'),
                name: emblem.name, // Garde le nom tel quel
                code: emblem.code, // Garde le code exactement tel quel
                status: 'available' as const
            };
        });

        // Sanitiser le contributeur
        const sanitizedContributor: IContributor = {
            bungieId: contributor.bungieId.toString(),
            displayName: contributor.displayName.toString().substring(0, MAX_TITLE_LENGTH), // Utilisation de la constante
            isAnonymous: !!contributor.isAnonymous
        };

        // Sanitiser les médias si fournis (autant que d'emblèmes)
        const sanitizedMedia = Array.isArray(media) 
            ? media.filter((m: any) => m.url && typeof m.url === 'string')
                   .slice(0, sanitizedEmblems.length) // Max autant que d'emblèmes
                   .map((m: any) => ({
                       url: m.url, // URL exacte sans trim
                       legend: m.legend ? m.legend.toString().trim().substring(0, MAX_LEGEND_LENGTH) : undefined // Légende peut être trimmée
                   }))
            : [];

        const contractData: Partial<IContract> = {
            contractId: generateUniqueId('CONT'),
            contributor: sanitizedContributor,
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

        // Ajouter le contrat à l'agent
        agent.contracts.push({
            contractMongoId: newContract._id,
            contractId: newContract.contractId
        });
        await agent.save();

        return res.status(201).json({
            success: true,
            data: {
                contract: newContract
            },
            message: 'Contract created successfully'
        });
    } catch (error: any) {
        console.error('Contract creation error:', {
            timestamp: new Date().toISOString(),
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

        // Validation de l'authentification
        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        // Validation de l'ID du contrat
        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        // Vérification des droits d'accès
        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({
                success: false,
                error: error || 'Access denied'
            });
        }

        // Log de la suppression pour audit
        console.log('Contract deleted:', {
            timestamp: new Date().toISOString(),
            deleterId: req.user?.agentId,
            contractId: contractId,
            contributorBungieId: contract.contributor?.bungieId
        });

        // Supprimer le contrat
        await contract.deleteOne();

        // Retirer le contrat des agents
        await AgentModel.updateMany(
            { 'contracts.contractId': contractId },
            { $pull: { contracts: { contractId: contractId } } }
        );

        return res.json({
            success: true,
            message: 'Contract deleted successfully'
        });
    } catch (error: any) {
        console.error('Contract deletion error:', {
            timestamp: new Date().toISOString(),
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

        // Validation de l'authentification
        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        // Validation de l'ID du contrat
        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        // Vérification des droits d'accès
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

        // Validation et mise à jour du statut
        if (status !== undefined && VALID_CONTRACT_STATUSES.includes(status)) {
            updateData.status = status;
        }

        // Validation de la date limite
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

        // Mise à jour des médias (autant que d'emblèmes dans le contrat)
        if (media !== undefined && Array.isArray(media)) {
            const maxMedia = contract.emblems?.length || MAX_CODES_PER_CONTRACT;
            updateData.media = media.filter((m: any) => m.url && typeof m.url === 'string')
                                   .slice(0, maxMedia) // Max autant que d'emblèmes
                                   .map((m: any) => ({
                                       url: m.url, // URL exacte sans modification
                                       legend: m.legend ? m.legend.toString().trim().substring(0, MAX_LEGEND_LENGTH) : undefined // Légende peut être trimmée
                                   }));
        }

        // Mise à jour des booléens
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
            timestamp: new Date().toISOString(),
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
        const isFounder = req.user?.protocol?.role === 'FOUNDER';
        const targetAgentId = isFounder ? (req.params.agentId || userBungieId) : userBungieId;

        // Validation de l'authentification
        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!targetAgentId) {
            return res.status(400).json({
                success: false,
                error: 'Agent ID required'
            });
        }

        // Validation de l'ID de l'agent
        if (typeof targetAgentId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid agent ID'
            });
        }

        const agent = await AgentModel.findOne({ bungieId: targetAgentId }).populate('contracts.contractMongoId');

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        const contracts = agent.contracts.map((c: { contractMongoId: any; }) => c.contractMongoId).filter(Boolean);

        return res.json({
            success: true,
            data: {
                contracts,
                count: contracts.length
            },
            message: 'Agent contracts retrieved successfully'
        });
    } catch (error: any) {
        console.error('Agent contracts fetch error:', {
            timestamp: new Date().toISOString(),
            requesterId: req.user?.agentId,
            targetAgentId: req.params.agentId,
            ip: req.ip
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

        // Validation de l'authentification
        if (!userBungieId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        // Validation de l'ID du contrat
        if (!contractId || typeof contractId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid contract ID'
            });
        }

        // Vérification des droits d'accès
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
            timestamp: new Date().toISOString(),
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
        // Cette fonction est réservée aux fondateurs (vérifiée au niveau des routes)
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
            timestamp: new Date().toISOString(),
            requesterId: req.user?.agentId,
            ip: req.ip
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};