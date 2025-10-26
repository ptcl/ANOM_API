import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { Agent } from '../models/agent.model';
import { formatForUser } from '../utils';
import { findAgentByIdentifier } from '../utils/verifyAgent.helper';

export const getProfilAgent = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const agent = await Agent.findById(agentId)
            .populate({
                path: "protocol.badges.badgeId",
                model: "Badge",
                select: "badgeId name description rarity icon obtainable"
            })
            .lean();

        if (!agent || !agent.protocol) {
            return res.status(404).json({
                success: false,
                error: "Agent protocol not found"
            });
        }

        const formattedAgent = {
            _id: agent._id,
            bungieId: agent.bungieId,
            destinyMemberships: agent.destinyMemberships,
            bungieUser: agent.bungieUser,
            protocol: {
                agentName: agent.protocol.agentName,
                customName: agent.protocol.customName,
                badges: agent.protocol.badges,
                species: agent.protocol.species,
                roles: agent.protocol.roles,
                clearanceLevel: agent.protocol.clearanceLevel,
                hasSeenRecruitment: agent.protocol.hasSeenRecruitment,
                protocolJoinedAt: agent.protocol.protocolJoinedAt,
                group: agent.protocol.group,
                settings: agent.protocol.settings
            },
            lastActivity: agent.lastActivity,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt
        };

        return res.json({
            success: true,
            data: {
                agent: formattedAgent
            },
            message: 'Profile retrieved successfully'
        });
    } catch (error: any) {
        console.error('Profile fetch error:', {
            timestamp: formatForUser(),
            agentId: req.user?.agentId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const updateProfilAgent = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;
        const updateData = req.body;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!updateData || typeof updateData !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid payload'
            });
        }

        const existingAgent = await findAgentByIdentifier(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        const flattenedData: any = {};

        if (updateData.protocol) {
            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                flattenedData['protocol.hasSeenRecruitment'] = !!updateData.protocol.hasSeenRecruitment;
            }

            if (updateData.protocol.customName !== undefined) {
                if (typeof updateData.protocol.customName === 'string' &&
                    updateData.protocol.customName.length <= 50 &&
                    updateData.protocol.customName.trim().length > 0) {
                    flattenedData['protocol.customName'] = updateData.protocol.customName.trim();
                } else if (updateData.protocol.customName === null || updateData.protocol.customName === '') {
                    flattenedData['protocol.customName'] = undefined;
                }
            }

            // species
            if (updateData.protocol.species !== undefined &&
                ['HUMAN', 'EXO', 'AWOKEN'].includes(updateData.protocol.species)) {
                flattenedData['protocol.species'] = updateData.protocol.species;
            }

            // settings
            if (updateData.protocol.settings) {
                if (updateData.protocol.settings.notifications !== undefined) {
                    flattenedData['protocol.settings.notifications'] = !!updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    flattenedData['protocol.settings.publicProfile'] = !!updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.protocolOSTheme !== undefined &&
                    ['DEFAULT', 'DARKNESS'].includes(updateData.protocol.settings.protocolOSTheme)) {
                    flattenedData['protocol.settings.protocolOSTheme'] = updateData.protocol.settings.protocolOSTheme;
                }

                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    flattenedData['protocol.settings.protocolSounds'] = !!updateData.protocol.settings.protocolSounds;
                }

                if (updateData.protocol.settings.language !== undefined &&
                    typeof updateData.protocol.settings.language === 'string' &&
                    updateData.protocol.settings.language.length <= 10) {
                    flattenedData['protocol.settings.language'] = updateData.protocol.settings.language.trim();
                }
            }
        }

        if (Object.keys(flattenedData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        console.log('Agent profile update:', {
            agentId: existingAgent._id?.toString(),
            fields: Object.keys(flattenedData),
            timestamp: formatForUser()
        });

        // ✅ Utiliser le vrai MongoDB _id pour l'update
        const updatedAgent = await agentService.updateAgentProfile(
            existingAgent._id!.toString(),
            flattenedData
        );

        if (!updatedAgent) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }

        return res.json({
            success: true,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieUser: updatedAgent.bungieUser,
                    destinyMemberships: updatedAgent.destinyMemberships,
                    protocol: {
                        agentName: updatedAgent.protocol.agentName,
                        customName: updatedAgent.protocol.customName,
                        species: updatedAgent.protocol.species,
                        hasSeenRecruitment: updatedAgent.protocol.hasSeenRecruitment,
                        settings: updatedAgent.protocol.settings
                    },
                    createdAt: updatedAgent.createdAt,
                    updatedAt: updatedAgent.updatedAt
                }
            },
            message: 'Profile updated successfully'
        });
    } catch (error: any) {
        console.error('Profile update error:', {
            timestamp: formatForUser(),
            agentId: req.user?.agentId,
            error: error.message,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const DeleteOwnAccount = async (req: Request, res: Response) => {
    try {
        const agentId = (req as any).user?.agentId;
        const { confirm } = req.body;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const agent = await findAgentByIdentifier(agentId);
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        if (agent.protocol?.roles.includes('FOUNDER')) {
            return res.status(403).json({
                success: false,
                error: 'Les comptes FOUNDER ne peuvent pas être supprimés',
                message: 'Contactez un administrateur pour supprimer votre compte'
            });
        }

        if (confirm !== 'DELETE_MY_ACCOUNT') {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Pour confirmer la suppression de votre compte, renvoyez { "confirm": "DELETE_MY_ACCOUNT" }',
                warning: 'Cette action est irréversible. Toutes vos données seront perdues.'
            });
        }

        console.log('⚠️ Self-deletion initiated:', {
            agentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            timestamp: formatForUser()
        });

        const deletedInfo = {
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            roles: agent.protocol?.roles
        };

        await Agent.findByIdAndDelete(agent._id);

        console.log('✅ Account self-deleted:', {
            ...deletedInfo,
            timestamp: formatForUser()
        });

        return res.status(200).json({
            success: true,
            message: 'Votre compte a été supprimé avec succès',
            data: {
                deletedAt: new Date()
            }
        });

    } catch (error: any) {
        console.error('❌ Error during self-deletion:', {
            agentId: (req as any).user?.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAllAgents = async (req: Request, res: Response) => {
    try {
        const agents = await Agent.find({
            $or: [
                { 'protocol.settings.publicProfile': true },
                { 'protocol.settings.publicProfile': { $exists: false } }
            ]
        }).lean();

        const formattedAgents = agents.map(agent => ({
            bungieUser: {
                bungieId: agent.bungieId,
                uniqueName: agent.bungieUser?.uniqueName || 'Inconnu',
                profilePicturePath: agent.bungieUser?.profilePicturePath || null

            },
            protocol: {
                agentName: agent.protocol?.agentName || 'Agent Inconnu',
                customName: agent.protocol?.customName || null,
                badgeIds: agent.protocol?.badges || [],
                species: agent.protocol?.species || 'UNKNOWN',
                roles: agent.protocol?.roles || ['AGENT'],
                group: agent.protocol?.group || null
            },
            joinedAt: agent.protocol?.protocolJoinedAt || agent.createdAt
        }));

        return res.json({
            success: true,
            data: {
                agents: formattedAgents,
                count: formattedAgents.length
            },
            message: 'Protocol agents retrieved successfully'
        });
    } catch (error: any) {
        console.error('Public agents fetch error:', {
            timestamp: formatForUser(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const DeactivateOwnAccount = async (req: Request, res: Response) => {
    try {
        const agentId = (req as any).user?.agentId;
        const { reason, confirm } = req.body;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const agent = await findAgentByIdentifier(agentId);
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        if (agent.isActive === false) {
            return res.status(400).json({
                success: false,
                error: 'Votre compte est déjà désactivé',
                message: 'Contactez un administrateur pour le réactiver'
            });
        }

        if (agent.protocol?.roles.includes('FOUNDER')) {
            return res.status(403).json({
                success: false,
                error: 'Les comptes FOUNDER ne peuvent pas être désactivés',
                message: 'Contactez un autre FOUNDER si nécessaire'
            });
        }

        if (confirm !== true) {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Pour confirmer la désactivation, renvoyez { "confirm": true }',
                info: 'Votre compte sera suspendu. Vous pourrez le réactiver en contactant un administrateur.'
            });
        }

        console.log('⚠️ Self-deactivation initiated:', {
            agentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            reason: reason || 'No reason provided',
            timestamp: formatForUser()
        });

        const updatedAgent = await Agent.findByIdAndUpdate(
            agent._id,
            {
                $set: {
                    isActive: false,
                    deactivatedAt: new Date(),
                    deactivationReason: reason || 'Self-deactivation',
                    deactivatedBy: agent._id,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        console.log('✅ Account self-deactivated:', {
            agentId: updatedAgent?._id?.toString(),
            timestamp: formatForUser()
        });

        return res.status(200).json({
            success: true,
            message: 'Votre compte a été désactivé',
            data: {
                deactivatedAt: updatedAgent?.deactivatedAt,
                note: 'Contactez un administrateur pour réactiver votre compte'
            }
        });

    } catch (error: any) {
        console.error('❌ Error during self-deactivation:', {
            agentId: (req as any).user?.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
