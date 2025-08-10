import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { IAgent } from '../types/agent';


export const FounderUpdateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        if (!agentId) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters',
                message: 'Agent ID is required'
            });
        }

        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                message: 'Agent profile could not be found'
            });
        }

        const sanitizedData: Partial<IAgent> = {};

        if (updateData.protocol) {
            sanitizedData.protocol = {
                agentName: existingAgent.protocol.agentName,
                customName: existingAgent.protocol.customName,
                species: existingAgent.protocol.species,
                role: existingAgent.protocol.role,
                clearanceLevel: existingAgent.protocol.clearanceLevel,
                hasSeenRecruitment: existingAgent.protocol.hasSeenRecruitment,
                protocolJoinedAt: existingAgent.protocol.protocolJoinedAt,
                group: existingAgent.protocol.group,
                settings: { ...existingAgent.protocol.settings }
            };

            if (updateData.protocol.agentName !== undefined) {
                sanitizedData.protocol.agentName = updateData.protocol.agentName;
            }
            if (updateData.protocol.customName !== undefined) {
                sanitizedData.protocol.customName = updateData.protocol.customName;
            }
            if (updateData.protocol.species !== undefined) {
                sanitizedData.protocol.species = updateData.protocol.species;
            }
            if (updateData.protocol.role !== undefined) {
                sanitizedData.protocol.role = updateData.protocol.role;
            }
            if (updateData.protocol.clearanceLevel !== undefined) {
                sanitizedData.protocol.clearanceLevel = updateData.protocol.clearanceLevel;
            }
            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                sanitizedData.protocol.hasSeenRecruitment = updateData.protocol.hasSeenRecruitment;
            }
            if (updateData.protocol.protocolJoinedAt !== undefined) {
                sanitizedData.protocol.protocolJoinedAt = updateData.protocol.protocolJoinedAt;
            }
            if (updateData.protocol.group !== undefined) {
                sanitizedData.protocol.group = updateData.protocol.group;
            }

            if (updateData.protocol.settings) {
                if (updateData.protocol.settings.notifications !== undefined) {
                    sanitizedData.protocol.settings.notifications = updateData.protocol.settings.notifications;
                }
                if (updateData.protocol.settings.publicProfile !== undefined) {
                    sanitizedData.protocol.settings.publicProfile = updateData.protocol.settings.publicProfile;
                }
                if (updateData.protocol.settings.protocolOSTheme !== undefined) {
                    sanitizedData.protocol.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme;
                }
                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    sanitizedData.protocol.settings.protocolSounds = updateData.protocol.settings.protocolSounds;
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
                    bungieId: updatedAgent.bungieId,
                    protocol: updatedAgent.protocol,
                    lastActivity: updatedAgent.lastActivity,
                    updatedAt: updatedAgent.updatedAt
                }
            },
            message: `Agent ${updatedAgent.protocol.agentName} updated successfully by admin`
        });
    } catch (error: any) {
        console.error('❌ Error in admin update agent:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update agent',
            message: error.message
        });
    }
};