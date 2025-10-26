import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { IAgent } from '../types/agent';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { formatForUser } from '../utils';
import { findAgentByIdentifier, validateIdentifier } from '../utils/verifyAgent.helper';
import { Agent } from '../models/agent.model';

export const FounderUpdateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide ou manquant',
                error: 'validation_error'
            });
        }

        if (!updateData || typeof updateData !== 'object') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Données de mise à jour invalides',
                error: 'validation_error'
            });
        }

        const existingAgent = await findAgentByIdentifier(agentId);
        if (!existingAgent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Profil d\'agent non trouvé',
                error: 'not_found'
            });
        }

        const sanitizedData: Partial<IAgent> = {};

        if (updateData.protocol && typeof updateData.protocol === 'object') {
            if (!existingAgent.protocol) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'L\'agent n\'a pas de protocole configuré',
                    error: 'invalid_state'
                });
            }

            const protocolUpdates: any = {};

            if (updateData.protocol.agentName !== undefined) {
                if (typeof updateData.protocol.agentName !== 'string' || updateData.protocol.agentName.trim().length === 0) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom d\'agent ne peut pas être vide',
                        error: 'validation_error'
                    });
                }
                if (updateData.protocol.agentName.length > 50) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom d\'agent ne peut pas dépasser 50 caractères',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.agentName = updateData.protocol.agentName.trim();
            }

            if (updateData.protocol.customName !== undefined) {
                if (updateData.protocol.customName && (typeof updateData.protocol.customName !== 'string' || updateData.protocol.customName.length > 50)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom personnalisé ne peut pas dépasser 50 caractères',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.customName = updateData.protocol.customName?.trim() || undefined;
            }

            if (updateData.protocol.species !== undefined) {
                const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                if (!allowedSpecies.includes(updateData.protocol.species)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Espèce invalide. Doit être HUMAN, EXO ou AWOKEN',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.species = updateData.protocol.species;
            }

            if (updateData.protocol.role !== undefined) {
                const allowedRoles = ['AGENT', 'SPECIALIST', 'FOUNDER'];
                if (!allowedRoles.includes(updateData.protocol.role)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Rôle invalide. Doit être AGENT, SPECIALIST ou FOUNDER',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.role = updateData.protocol.role;
            }

            if (updateData.protocol.clearanceLevel !== undefined) {
                if (typeof updateData.protocol.clearanceLevel !== 'number' || updateData.protocol.clearanceLevel < 0 || updateData.protocol.clearanceLevel > 10) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Niveau d\'autorisation invalide (0-10)',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.clearanceLevel = updateData.protocol.clearanceLevel;
            }

            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                if (typeof updateData.protocol.hasSeenRecruitment !== 'boolean') {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'hasSeenRecruitment doit être un booléen',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.hasSeenRecruitment = updateData.protocol.hasSeenRecruitment;
            }

            if (updateData.protocol.protocolJoinedAt !== undefined) {
                const joinDate = new Date(updateData.protocol.protocolJoinedAt);
                if (isNaN(joinDate.getTime())) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Date d\'adhésion au protocole invalide',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.protocolJoinedAt = joinDate;
            }

            if (updateData.protocol.group !== undefined) {
                const allowedGroups = ['PROTOCOL', 'AURORA', 'ZENITH'];
                if (!allowedGroups.includes(updateData.protocol.group)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Groupe invalide. Doit être PROTOCOL, AURORA ou ZENITH',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.group = updateData.protocol.group;
            }

            if (updateData.protocol.settings && typeof updateData.protocol.settings === 'object') {
                protocolUpdates.settings = {};

                if (updateData.protocol.settings.notifications !== undefined) {
                    if (typeof updateData.protocol.settings.notifications !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'notifications doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.notifications = updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    if (typeof updateData.protocol.settings.publicProfile !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'publicProfile doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.publicProfile = updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.protocolOSTheme !== undefined) {
                    const allowedThemes = ['DEFAULT', 'DARKNESS'];
                    if (!allowedThemes.includes(updateData.protocol.settings.protocolOSTheme)) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Thème invalide. Doit être DEFAULT ou DARKNESS',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme;
                }

                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    if (typeof updateData.protocol.settings.protocolSounds !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'protocolSounds doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.protocolSounds = updateData.protocol.settings.protocolSounds;
                }

                if (updateData.protocol.settings.language !== undefined) {
                    if (typeof updateData.protocol.settings.language !== 'string' || updateData.protocol.settings.language.length > 10) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Langue invalide',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.language = updateData.protocol.settings.language.trim();
                }
            }

            if (Object.keys(protocolUpdates).length > 0) {
                sanitizedData.protocol = protocolUpdates;
            }
        }

        if (Object.keys(sanitizedData).length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Aucune donnée valide à mettre à jour',
                error: 'no_changes'
            });
        }

        const flattenedData: any = {};

        if (sanitizedData.protocol) {
            for (const [key, value] of Object.entries(sanitizedData.protocol)) {
                if (key === 'settings' && typeof value === 'object' && value !== null) {
                    for (const [settingKey, settingValue] of Object.entries(value)) {
                        flattenedData[`protocol.settings.${settingKey}`] = settingValue;
                    }
                } else {
                    flattenedData[`protocol.${key}`] = value;
                }
            }
        }

        for (const [key, value] of Object.entries(sanitizedData)) {
            if (key !== 'protocol') {
                flattenedData[key] = value;
            }
        }

        const updatedAgent = await agentService.updateAgentProfile(existingAgent._id!.toString(), flattenedData);

        if (!updatedAgent) {
            console.error('Failed to update agent profile:', {
                agentId: existingAgent._id?.toString(),
                sanitizedData,
                timestamp: formatForUser()
            });

            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la mise à jour du profil d\'agent',
                error: 'update_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Profil de l'agent ${updatedAgent.protocol?.agentName || agentId} mis à jour avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    protocol: {
                        agentName: updatedAgent.protocol?.agentName,
                        customName: updatedAgent.protocol?.customName,
                        species: updatedAgent.protocol?.species,
                        role: updatedAgent.protocol?.role,
                        clearanceLevel: updatedAgent.protocol?.clearanceLevel,
                        hasSeenRecruitment: updatedAgent.protocol?.hasSeenRecruitment,
                        protocolJoinedAt: updatedAgent.protocol?.protocolJoinedAt,
                        group: updatedAgent.protocol?.group,
                        settings: updatedAgent.protocol?.settings
                    },
                    lastActivity: updatedAgent.lastActivity,
                    updatedAt: updatedAgent.updatedAt
                }
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'agent par le founder:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};

export const FounderDeleteAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { confirm } = req.body;

        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide ou manquant',
                error: 'validation_error'
            });
        }

        const agentToDelete = await findAgentByIdentifier(agentId);
        if (!agentToDelete) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Profil d\'agent non trouvé',
                error: 'not_found'
            });
        }

        const founderAgentId = (req as any).user?.agentId;
        if (founderAgentId && agentToDelete._id?.toString() === founderAgentId) {
            console.warn('Founder attempted to delete own account:', {
                founderAgentId,
                timestamp: formatForUser()
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'Vous ne pouvez pas supprimer votre propre compte',
                error: 'self_deletion_forbidden'
            });
        }

        if (agentToDelete.protocol?.role === 'FOUNDER') {
            console.warn('Attempt to delete another FOUNDER account:', {
                targetAgentId: agentToDelete._id?.toString(),
                targetAgentName: agentToDelete.protocol?.agentName,
                requestedBy: founderAgentId,
                timestamp: formatForUser()
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'Vous ne pouvez pas supprimer un compte FOUNDER',
                error: 'founder_deletion_forbidden'
            });
        }

        if (confirm !== true) {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Suppression nécessite une confirmation',
                data: {
                    agent: {
                        _id: agentToDelete._id,
                        bungieId: agentToDelete.bungieId,
                        agentName: agentToDelete.protocol?.agentName,
                        uniqueName: agentToDelete.bungieUser?.uniqueName,
                        role: agentToDelete.protocol?.role,
                        joinedAt: agentToDelete.protocol?.protocolJoinedAt,
                        stats: agentToDelete.protocol?.stats
                    }
                },
                instructions: 'Pour confirmer la suppression, renvoyez la requête avec { "confirm": true } dans le body'
            });
        }

        const deletedAgentInfo = {
            _id: agentToDelete._id?.toString(),
            bungieId: agentToDelete.bungieId,
            uniqueName: agentToDelete.bungieUser?.uniqueName,
            agentName: agentToDelete.protocol?.agentName,
            displayName: agentToDelete.bungieUser?.displayName,
            role: agentToDelete.protocol?.role,
            clearanceLevel: agentToDelete.protocol?.clearanceLevel,
            group: agentToDelete.protocol?.group,
            joinedAt: agentToDelete.protocol?.protocolJoinedAt,
            totalBadges: agentToDelete.protocol?.badges?.length || 0,
            stats: agentToDelete.protocol?.stats,
            createdAt: agentToDelete.createdAt
        };

        await Agent.findByIdAndDelete(agentToDelete._id);
        return res.status(200).json({
            success: true,
            message: `Agent ${deletedAgentInfo.agentName || deletedAgentInfo.bungieId} supprimé avec succès`,
            data: {
                deletedAgent: deletedAgentInfo,
                deletedAt: new Date(),
                deletedBy: founderAgentId
            }
        });

    } catch (error: any) {
        console.error('❌ Erreur lors de la suppression de l\'agent:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack,
            deletedBy: (req as any).user?.agentId,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};


export const FounderAgentStatistics = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const stats = await agentService.getAgentStatistics();
        return res.json({
            success: true,
            data: {
                statistics: stats,
                generatedAt: now.toISOString()
            },
            message: 'Agent statistics retrieved successfully'
        });

    } catch (error: any) {
        console.error('Agent statistics error:', {
            timestamp: formatForUser(),
            founderId: req.user?.agentId,
            error: error.message,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const FounderRepairProfile = async (req: Request, res: Response) => {
    try {
        const requesterId = req.user?.agentId;
        const targetAgentId = req.params.agentId || requesterId;
        const isFounder = req.user?.protocol?.role === 'FOUNDER';

        if (!requesterId) {
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

        if (targetAgentId !== requesterId && !isFounder) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - Can only repair own profile'
            });
        }

        const success = await agentService.repairIncompleteProfile(targetAgentId);

        if (success) {
            return res.json({
                success: true,
                message: 'Profile repair completed successfully'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Profile repair failed'
            });
        }

    } catch (error: any) {
        console.error('Profile repair error:', {
            timestamp: formatForUser(),
            requesterId: req.user?.agentId,
            targetAgentId: req.params.agentId,
            error: error.message,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const FounderDeactivateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { reason } = req.body;

        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide',
                error: 'validation_error'
            });
        }

        const agent = await findAgentByIdentifier(agentId);
        if (!agent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Agent non trouvé',
                error: 'not_found'
            });
        }

        if (agent.isActive === false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Cet agent est déjà désactivé',
                error: 'already_deactivated',
                data: {
                    agentName: agent.protocol?.agentName,
                    deactivatedAt: agent.deactivatedAt
                }
            });
        }

        if (agent.protocol?.role === 'FOUNDER') {
            const founderAgentId = (req as any).user?.agentId;

            if (agent._id?.toString() !== founderAgentId) {
                return ApiResponseBuilder.error(res, 403, {
                    message: 'Impossible de désactiver un compte FOUNDER',
                    error: 'founder_deactivation_forbidden'
                });
            }
        }

        const updatedAgent = await Agent.findByIdAndUpdate(
            agent._id,
            {
                $set: {
                    isActive: false,
                    deactivatedAt: new Date(),
                    deactivationReason: reason || undefined,
                    deactivatedBy: (req as any).user?.agentId,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedAgent) {
            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la désactivation',
                error: 'deactivation_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agentId} désactivé avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    agentName: updatedAgent.protocol?.agentName,
                    isActive: updatedAgent.isActive,
                    deactivatedAt: updatedAgent.deactivatedAt,
                    deactivationReason: updatedAgent.deactivationReason
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error deactivating agent:', {
            agentId: req.params.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne',
            error: 'internal_server_error'
        });
    }
};

export const FounderReactivateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;

        // Validation de l'agentId
        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide',
                error: 'validation_error'
            });
        }

        const agent = await Agent.findOne({
            $or: [
                { _id: /^[0-9a-fA-F]{24}$/.test(agentId) ? agentId : null },
                { bungieId: agentId },
                { 'bungieUser.uniqueName': { $regex: new RegExp(`^${agentId}$`, 'i') } }
            ]
        });

        if (!agent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Agent non trouvé',
                error: 'not_found'
            });
        }

        if (agent.isActive !== false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Cet agent est déjà actif',
                error: 'already_active'
            });
        }

        const updatedAgent = await Agent.findByIdAndUpdate(
            agent._id,
            {
                $set: {
                    isActive: true,
                    reactivatedAt: new Date(),
                    reactivatedBy: (req as any).user?.agentId,
                    updatedAt: new Date()
                },
                $unset: {
                    deactivatedAt: '',
                    deactivationReason: '',
                    deactivatedBy: ''
                }
            },
            { new: true }
        );

        if (!updatedAgent) {
            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la réactivation',
                error: 'reactivation_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agentId} réactivé avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    agentName: updatedAgent.protocol?.agentName,
                    isActive: updatedAgent.isActive,
                    reactivatedAt: updatedAgent.reactivatedAt
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error reactivating agent:', {
            agentId: req.params.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne',
            error: 'internal_server_error'
        });
    }
};


export const GetDeactivatedAgents = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        const [agents, total] = await Promise.all([
            Agent.find({ isActive: false })
                .select('bungieId bungieUser.uniqueName bungieUser.displayName protocol.agentName protocol.role protocol.clearanceLevel deactivatedAt deactivationReason deactivatedBy')
                .sort({ deactivatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Agent.countDocuments({ isActive: false })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                agents,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });

    } catch (error: any) {
        console.error('Error retrieving deactivated agents:', {
            error: error.message,
            timestamp: formatForUser()
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};