import { Request, Response } from 'express';
import { agentService } from '../services/agent.service';
import { Agent } from '../models/agent.model';
import { Role } from '../models/role.model';
import { logger } from '../utils';
import { findAgentByIdentifier } from '../utils/verifyAgent.helper';
import { agentMigrationService, agentStatsService } from '../services/agentStat.service';

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
        await agentStatsService.syncAgentStats(agentId);
        if (!agent || !agent.protocol) {
            return res.status(404).json({
                success: false,
                error: "Agent protocol not found"
            });
        }

        // Récupérer les détails des rôles
        const roleIds = agent.protocol.roles || [];
        const rolesDetails = await Role.find({ roleId: { $in: roleIds.map((r: string) => r.toUpperCase()) } })
            .select('roleId name description color')
            .lean();

        // Mapper les rôles avec leurs détails
        const rolesWithDetails = roleIds.map((roleId: string) => {
            const roleDetail = rolesDetails.find((r: any) => r.roleId === roleId.toUpperCase());
            return roleDetail ? {
                roleId: roleDetail.roleId,
                name: roleDetail.name,
                description: roleDetail.description,
                color: roleDetail.color
            } : {
                roleId: roleId,
                name: roleId,
                description: null,
                color: '#808080'
            };
        });

        const formattedAgent = {
            _id: agent._id,
            bungieId: agent.bungieId,
            destinyMemberships: agent.destinyMemberships,
            bungieUser: agent.bungieUser,
            protocol: {
                agentName: agent.protocol.agentName,
                customName: agent.protocol.customName,
                bio: agent.protocol.bio,
                badges: agent.protocol.badges,
                species: agent.protocol.species,
                roles: rolesWithDetails,
                clearanceLevel: agent.protocol.clearanceLevel,
                hasSeenRecruitment: agent.protocol.hasSeenRecruitment,
                protocolJoinedAt: agent.protocol.protocolJoinedAt,
                division: agent.protocol.division,
                settings: agent.protocol.settings,
                stats: agent.protocol.stats
            },
            timelines: agent.timelines,
            lastActivity: agent.lastActivity,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt
        };

        return res.json({
            success: true,
            data: formattedAgent,
            message: 'Profile retrieved successfully'
        })
    } catch (error: any) {
        logger.error('Profile fetch error:', {
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

            if (updateData.protocol.bio !== undefined) {
                if (typeof updateData.protocol.bio === 'string' && updateData.protocol.bio.length <= 500) {
                    flattenedData['protocol.bio'] = updateData.protocol.bio.trim();
                } else if (updateData.protocol.bio === null || updateData.protocol.bio === '') {
                    flattenedData['protocol.bio'] = undefined;
                }
            }

            if (updateData.protocol.species !== undefined &&
                ['HUMAN', 'EXO', 'AWOKEN'].includes(updateData.protocol.species)) {
                flattenedData['protocol.species'] = updateData.protocol.species;
            }
            if (updateData.protocol.settings) {
                if (updateData.protocol.settings.notifications !== undefined) {
                    flattenedData['protocol.settings.notifications'] = !!updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    flattenedData['protocol.settings.publicProfile'] = !!updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.themes !== undefined &&
                    typeof updateData.protocol.settings.themes === 'object') {
                    flattenedData['protocol.settings.themes'] = updateData.protocol.settings.themes;
                }

                if (updateData.protocol.settings.soundEffects !== undefined) {
                    flattenedData['protocol.settings.soundEffects'] = !!updateData.protocol.settings.soundEffects;
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

        logger.info('Agent profile update:', {
            agentId: existingAgent._id?.toString(),
            fields: Object.keys(flattenedData)
        });

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
        logger.error('Profile update error:', {
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
                error: 'FOUNDER accounts cannot be deleted',
                message: 'Contact an administrator to delete your account'
            });
        }

        if (confirm !== 'DELETE_MY_ACCOUNT') {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Confirm your account deletion by sending { "confirm": "DELETE_MY_ACCOUNT" }',
                warning: 'This action is irreversible and will permanently delete your account and all associated data.'
            });
        }

        logger.info('⚠️ Self-deletion initiated:', {
            agentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName
        });

        const deletedInfo = {
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            roles: agent.protocol?.roles
        };

        await Agent.findByIdAndDelete(agent._id);

        logger.info('Account self-deleted:', {
            ...deletedInfo
        });

        return res.status(200).json({
            success: true,
            message: 'Your account has been deleted successfully',
            data: {
                deletedAt: new Date()
            }
        });

    } catch (error: any) {
        logger.error('Error during self-deletion:', {
            agentId: (req as any).user?.agentId,
            error: error.message
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
                uniqueName: agent.bungieUser?.uniqueName || 'Unknown',
                profilePicturePath: agent.bungieUser?.profilePicturePath || null

            },
            protocol: {
                agentName: agent.protocol?.agentName || 'Agent unknown',
                customName: agent.protocol?.customName || null,
                badgeIds: agent.protocol?.badges || [],
                species: agent.protocol?.species || 'UNKNOWN',
                roles: agent.protocol?.roles || ['AGENT'],
                division: agent.protocol?.division || null
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
        logger.error('Public agents fetch error:', {
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
                error: 'Account already deactivated',
                message: 'Contact an administrator to reactivate it'
            });
        }

        if (agent.protocol?.roles.includes('FOUNDER')) {
            return res.status(403).json({
                success: false,
                error: 'FOUNDER accounts cannot be deactivated',
                message: 'Contact another FOUNDER if necessary'
            });
        }

        if (confirm !== true) {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'To confirm deactivation, resend { "confirm": true }',
                info: 'Your account will be suspended. You can reactivate it by contacting an administrator.'
            });
        }

        logger.info('⚠️ Self-deactivation initiated:', {
            agentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            reason: reason || 'No reason provided',
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

        logger.info('✅ Account self-deactivated:', {
            agentId: updatedAgent?._id?.toString()
        });

        return res.status(200).json({
            success: true,
            message: 'Your account has been deactivated',
            data: {
                deactivatedAt: updatedAgent?.deactivatedAt,
                note: 'Contact an administrator to reactivate your account'
            }
        });

    } catch (error: any) {
        logger.error('❌ Error during self-deactivation:', {
            agentId: (req as any).user?.agentId,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};


export const syncAgentStats = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;
        if (!agentId)
            return res.status(401).json({ success: false, message: "Unauthorized" });

        const stats = await agentStatsService.syncAgentStats(agentId);
        await agentMigrationService.cleanObsoleteFields(agentId);

        return res.json({
            success: true,
            message: "Agent stats synchronized",
            data: stats
        });
    } catch (error) {
        logger.error("Stats sync error:", error);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};