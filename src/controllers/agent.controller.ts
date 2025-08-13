import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { IAgent } from '../types/agent';
import { AgentModel } from '../models/agent.model';

export const getAgentByMembership = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;

        if (!membershipType || !membershipId) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters',
                message: 'membershipType and membershipId are required'
            });
        }

        const agent = await agentService.getAgentByDestinyMembership(
            parseInt(membershipType),
            membershipId
        );

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                message: `No agent found with membershipType ${membershipType} and membershipId ${membershipId}`
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
                species: agent.protocol.species,
                role: agent.protocol.role,
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
            message: `Retrieved agent profile for ${agent.protocol.agentName}`
        });
    } catch (error: any) {
        console.error('❌ Error fetching agent by membership:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch agent profile',
            message: error.message
        });
    }
};

export const updateAgentByMembership = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;

        if (!membershipType || !membershipId) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters',
                message: 'membershipType and membershipId are required'
            });
        }

        const agent = await agentService.getAgentByDestinyMembership(
            parseInt(membershipType),
            membershipId
        );

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                message: `No agent found with membershipType ${membershipType} and membershipId ${membershipId}`
            });
        }

        return res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'This endpoint is not yet implemented'
        });
    } catch (error: any) {
        console.error('❌ Error updating agent by membership:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update agent',
            message: error.message
        });
    }
};

export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to view your profile'
            });
        }

        const agent = await agentService.getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
                message: 'Your agent profile could not be found'
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
                species: agent.protocol.species,
                role: agent.protocol.role,
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
            message: `Retrieved your agent profile, ${agent.protocol.agentName}`
        });
    } catch (error: any) {
        console.error('❌ Error fetching agent profile:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
};

export const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;
        const updateData = req.body;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to update your profile'
            });
        }

        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
                message: 'Your agent profile could not be found'
            });
        }

        const sanitizedData: Partial<IAgent> = {};

        if (updateData.protocol) {
            sanitizedData.protocol = {
                agentName: existingAgent.protocol.agentName,
                species: existingAgent.protocol.species,
                role: existingAgent.protocol.role,
                clearanceLevel: existingAgent.protocol.clearanceLevel,
                hasSeenRecruitment: existingAgent.protocol.hasSeenRecruitment,
                settings: {
                    notifications: existingAgent.protocol.settings.notifications,
                    publicProfile: existingAgent.protocol.settings.publicProfile,
                    protocolOSTheme: existingAgent.protocol.settings.protocolOSTheme || 'DEFAULT',
                    protocolSounds: existingAgent.protocol.settings.protocolSounds || true
                }
            };

            if (updateData.protocol.customName !== undefined) {
                sanitizedData.protocol.customName = updateData.protocol.customName;
            }

            if (updateData.protocol.species !== undefined &&
                ['HUMAN', 'EXO', 'AWOKEN'].includes(updateData.protocol.species)) {
                sanitizedData.protocol.species = updateData.protocol.species as 'HUMAN' | 'EXO' | 'AWOKEN';
            }

            if (updateData.protocol.settings) {
                if (updateData.protocol.settings.notifications !== undefined) {
                    sanitizedData.protocol.settings.notifications = !!updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    sanitizedData.protocol.settings.publicProfile = !!updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.protocolOSTheme !== undefined &&
                    ['DEFAULT', 'DARKNESS'].includes(updateData.protocol.settings.protocolOSTheme)) {
                    sanitizedData.protocol.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme as 'DEFAULT' | 'DARKNESS';
                }

                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    sanitizedData.protocol.settings.protocolSounds = !!updateData.protocol.settings.protocolSounds;
                }
            }
        }

        const updatedAgent = await agentService.updateAgentProfile(agentId, sanitizedData);

        if (!updatedAgent) {
            return res.status(500).json({
                success: false,
                error: 'Update failed',
                message: 'Failed to update agent profile'
            });
        }

        return res.json({
            success: true,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    protocol: {
                        agentName: updatedAgent.protocol.agentName,
                        customName: updatedAgent.protocol.customName,
                        species: updatedAgent.protocol.species,
                        settings: updatedAgent.protocol.settings
                    },
                    updatedAt: updatedAgent.updatedAt
                }
            },
            message: `Profile updated successfully, ${updatedAgent.protocol.agentName}`
        });
    } catch (error: any) {
        console.error('❌ Error updating agent profile:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            message: error.message
        });
    }
};

export const getAllAgents = async (req: Request, res: Response) => {
    try {
        const agents = await AgentModel.find().lean();
        const formattedAgents = agents.map(agent => ({
            _id: agent._id,
            bungieId: agent.bungieId,

            protocol: {
                agentName: agent.protocol.agentName,
                species: agent.protocol.species,
                role: agent.protocol.role,
                group: agent.protocol.group
            },
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt || agent.lastActivity
        }));

        return res.json({
            success: true,
            data: {
                agents: formattedAgents,
                count: formattedAgents.length
            },
            message: `Retrieved ${formattedAgents.length} agents`
        });
    } catch (error: any) {
        console.error('❌ Error fetching all agents:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch agents',
            message: error.message
        });
    }
};



