import { Request, Response } from 'express';
import { agentService } from '../services/agent.service';
import { IAgent } from '../types/agent';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { logger } from '../utils';
import { Agent } from '../models/agent.model';
import * as roleService from '../services/role.service';


export const FounderUpdateAgent = async (req: Request, res: Response) => {
    try {
        const existingAgent = req.resolvedAgent!;
        const updateData = req.body;

        if (!updateData || typeof updateData !== 'object') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Invalid update data',
                error: 'validation_error'
            });
        }

        const sanitizedData: Partial<IAgent> = {};

        if (updateData.protocol && typeof updateData.protocol === 'object') {
            if (!existingAgent.protocol) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Agent has no protocol configured',
                    error: 'invalid_state'
                });
            }

            const protocolUpdates: any = {};

            if (updateData.protocol.agentName !== undefined) {
                if (typeof updateData.protocol.agentName !== 'string' || updateData.protocol.agentName.trim().length === 0) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Agent name cannot be empty',
                        error: 'validation_error'
                    });
                }
                if (updateData.protocol.agentName.length > 50) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Agent name cannot exceed 50 characters',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.agentName = updateData.protocol.agentName.trim();
            }

            if (updateData.protocol.customName !== undefined) {
                if (updateData.protocol.customName && (typeof updateData.protocol.customName !== 'string' || updateData.protocol.customName.length > 50)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Custom name cannot exceed 50 characters',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.customName = updateData.protocol.customName?.trim() || undefined;
            }

            if (updateData.protocol.species !== undefined) {
                const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                if (!allowedSpecies.includes(updateData.protocol.species)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Invalid species. Must be HUMAN, EXO, or AWOKEN',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.species = updateData.protocol.species;
            }

            if (updateData.protocol.role !== undefined) {
                const allowedRoles = ["AGENT", "ECHO", "ORACLE", "ARCHITECT", "FOUNDER", "EMISSARY"];
                if (!allowedRoles.includes(updateData.protocol.role)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Invalid role. Must be AGENT or FOUNDER',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.role = updateData.protocol.role;
            }

            if (updateData.protocol.clearanceLevel !== undefined) {
                if (typeof updateData.protocol.clearanceLevel !== 'number' || updateData.protocol.clearanceLevel < 0 || updateData.protocol.clearanceLevel > 10) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Clearance level must be a number between 0 and 10',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.clearanceLevel = updateData.protocol.clearanceLevel;
            }

            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                if (typeof updateData.protocol.hasSeenRecruitment !== 'boolean') {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'hasSeenRecruitment must be a boolean',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.hasSeenRecruitment = updateData.protocol.hasSeenRecruitment;
            }

            if (updateData.protocol.protocolJoinedAt !== undefined) {
                const joinDate = new Date(updateData.protocol.protocolJoinedAt);
                if (isNaN(joinDate.getTime())) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Invalid protocol join date',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.protocolJoinedAt = joinDate;
            }

            if (updateData.protocol.division !== undefined) {
                protocolUpdates.division = updateData.protocol.division;
            }

            if (updateData.protocol.settings && typeof updateData.protocol.settings === 'object') {
                protocolUpdates.settings = {};

                if (updateData.protocol.settings.notifications !== undefined) {
                    if (typeof updateData.protocol.settings.notifications !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'notifications must be a boolean',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.notifications = updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    if (typeof updateData.protocol.settings.publicProfile !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'publicProfile must be a boolean',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.publicProfile = updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.protocolOSTheme !== undefined) {
                    const allowedThemes = ['DEFAULT', 'DARKNESS'];
                    if (!allowedThemes.includes(updateData.protocol.settings.protocolOSTheme)) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Invalid theme. Must be DEFAULT or DARKNESS',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme;
                }

                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    if (typeof updateData.protocol.settings.protocolSounds !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'protocolSounds must be a boolean',
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
                message: 'No valid data to update',
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
            logger.error('Failed to update agent profile:', {
                agentId: existingAgent._id?.toString(),
                sanitizedData
            });

            return ApiResponseBuilder.error(res, 500, {
                message: 'Failed to update agent profile',
                error: 'update_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Agent profile ${updatedAgent.protocol?.agentName || existingAgent._id} successfully updated`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    protocol: {
                        agentName: updatedAgent.protocol?.agentName,
                        customName: updatedAgent.protocol?.customName,
                        species: updatedAgent.protocol?.species,
                        roles: updatedAgent.protocol?.roles,
                        clearanceLevel: updatedAgent.protocol?.clearanceLevel,
                        hasSeenRecruitment: updatedAgent.protocol?.hasSeenRecruitment,
                        protocolJoinedAt: updatedAgent.protocol?.protocolJoinedAt,
                        division: updatedAgent.protocol?.division,
                        settings: updatedAgent.protocol?.settings
                    },
                    lastActivity: updatedAgent.lastActivity,
                    updatedAt: updatedAgent.updatedAt
                }
            }
        });

    } catch (error: any) {
        logger.error('Error while updating the agent by the founder:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const FounderDeleteAgent = async (req: Request, res: Response) => {
    try {
        const agentToDelete = req.resolvedAgent!;
        const { confirm } = req.body;

        const founderAgentId = (req as any).user?.agentId;
        if (founderAgentId && agentToDelete._id?.toString() === founderAgentId) {
            logger.warn('Founder attempted to delete own account:', {
                founderAgentId
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'You cannot delete your own account',
                error: 'self_deletion_forbidden'
            });
        }

        if (agentToDelete.protocol?.roles.includes('FOUNDER')) {
            logger.warn('Attempt to delete another FOUNDER account:', {
                targetAgentId: agentToDelete._id?.toString(),
                targetAgentName: agentToDelete.protocol?.agentName,
                requestedBy: founderAgentId
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'You cannot delete a FOUNDER account',
                error: 'founder_deletion_forbidden'
            });
        }

        if (confirm !== true) {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Deletion requires confirmation',
                data: {
                    agent: {
                        _id: agentToDelete._id,
                        bungieId: agentToDelete.bungieId,
                        agentName: agentToDelete.protocol?.agentName,
                        uniqueName: agentToDelete.bungieUser?.uniqueName,
                        roles: agentToDelete.protocol?.roles,
                        joinedAt: agentToDelete.protocol?.protocolJoinedAt,
                        stats: agentToDelete.protocol?.stats
                    }
                },
                instructions: 'To confirm deletion, resend the request with { "confirm": true } in the body'
            });
        }

        const deletedAgentInfo = {
            _id: agentToDelete._id?.toString(),
            bungieId: agentToDelete.bungieId,
            uniqueName: agentToDelete.bungieUser?.uniqueName,
            agentName: agentToDelete.protocol?.agentName,
            displayName: agentToDelete.bungieUser?.displayName,
            roles: agentToDelete.protocol?.roles,
            clearanceLevel: agentToDelete.protocol?.clearanceLevel,
            division: agentToDelete.protocol?.division,
            joinedAt: agentToDelete.protocol?.protocolJoinedAt,
            totalBadges: agentToDelete.protocol?.badges?.length || 0,
            stats: agentToDelete.protocol?.stats,
            createdAt: agentToDelete.createdAt
        };

        await Agent.findByIdAndDelete(agentToDelete._id);
        return res.status(200).json({
            success: true,
            message: `Agent ${deletedAgentInfo.agentName || deletedAgentInfo.bungieId} successfully deleted`,
            data: {
                deletedAgent: deletedAgentInfo,
                deletedAt: new Date(),
                deletedBy: founderAgentId
            }
        });

    } catch (error: any) {
        logger.error('Error deleting agent:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack,
            deletedBy: (req as any).user?.agentId || 'unknown'
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
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
        logger.error('Agent statistics error:', {
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
        const targetAgent = req.resolvedAgent;
        const isFounder = req.user?.protocol?.roles.includes('FOUNDER');

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!targetAgent) {
            return res.status(400).json({
                success: false,
                error: 'Agent ID required'
            });
        }

        if (targetAgent._id?.toString() !== requesterId && !isFounder) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - Can only repair own profile'
            });
        }

        const success = await agentService.repairIncompleteProfile(targetAgent._id!.toString());

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
        logger.error('Profile repair error:', {
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
        const agent = req.resolvedAgent!;
        const { reason } = req.body;

        if (agent.isActive === false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'This agent is already deactivated',
                error: 'already_deactivated',
                data: {
                    agentName: agent.protocol?.agentName,
                    deactivatedAt: agent.deactivatedAt
                }
            });
        }

        if (agent.protocol?.roles.includes('FOUNDER')) {
            const founderAgentId = (req as any).user?.agentId;

            if (agent._id?.toString() !== founderAgentId) {
                return ApiResponseBuilder.error(res, 403, {
                    message: 'You cannot deactivate a FOUNDER agent',
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
                message: 'Failed to deactivate agent',
                error: 'deactivation_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agent._id} successfully deactivated`,
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
        logger.error('Error deactivating agent:', {
            agentId: req.params.agentId,
            error: error.message
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const FounderReactivateAgent = async (req: Request, res: Response) => {
    try {
        const agent = req.resolvedAgent!;

        if (agent.isActive !== false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'This agent is already active',
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
                message: 'Failed to reactivate agent',
                error: 'reactivation_failed'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agent._id} successfully reactivated`,
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
        logger.error('❌ Error reactivating agent:', {
            agentId: req.params.agentId,
            error: error.message
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
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
        logger.error('Error retrieving deactivated agents:', {
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const promoteAgent = async (req: Request, res: Response) => {
    try {
        const agent = req.resolvedAgent!;
        const { roleId } = req.body;

        if (!roleId) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'roleId is required',
                error: 'validation_error'
            });
        }
        const targetRole = await roleService.getRoleById(roleId);
        if (!targetRole) {
            return ApiResponseBuilder.error(res, 404, {
                message: `RRole ${roleId} not found`,
                error: 'not_found'
            });
        }

        const currentRoles = agent.protocol?.roles || ['AGENT'];
        const roleToAdd = roleId.toUpperCase();

        if (currentRoles.includes(roleToAdd)) {
            return ApiResponseBuilder.error(res, 400, {
                message: `The agent already has the role ${roleToAdd}`,
                error: 'already_has_role'
            });
        }

        await Agent.findByIdAndUpdate(agent._id, {
            $addToSet: { 'protocol.roles': roleToAdd }
        });

        return res.json({
            success: true,
            message: `Role ${roleToAdd} added to agent`,
            data: {
                agentId: agent._id,
                addedRole: roleToAdd,
                roles: [...currentRoles, roleToAdd]
            }
        });

    } catch (error: any) {
        logger.error('Error promoting agent:', {
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const demoteAgent = async (req: Request, res: Response) => {
    try {
        const agent = req.resolvedAgent!;
        const { roleId } = req.body;

        if (!roleId) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'roleId is required',
                error: 'validation_error'
            });
        }

        const currentRoles = agent.protocol?.roles || ['AGENT'];
        const roleToRemove = roleId.toUpperCase();

        if (!currentRoles.includes(roleToRemove)) {
            return ApiResponseBuilder.error(res, 400, {
                message: `The agent does not have the role ${roleToRemove}`,
                error: 'does_not_have_role'
            });
        }

        if (currentRoles.length === 1) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Cannot remove the last role from the agent',
                error: 'cannot_remove_last_role'
            });
        }

        await Agent.findByIdAndUpdate(agent._id, {
            $pull: { 'protocol.roles': roleToRemove }
        });

        return res.json({
            success: true,
            message: `RRole ${roleToRemove} removed from agent`,
            data: {
                agentId: agent._id,
                removedRole: roleToRemove,
                roles: currentRoles.filter(r => r !== roleToRemove)
            }
        });

    } catch (error: any) {
        logger.error('Error demoting agent:', {
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};