import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';
import { agentService } from '../services/agentService';
import { AgentModel } from '../models/Agent';


/**
 * Récupère le profil d'un agent par son membershipType et membershipId
 * Ces paramètres sont recherchés dans le tableau destinyMemberships
 */
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

        // Recherche l'agent dont l'un des destinyMemberships correspond aux paramètres
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

        // Format de réponse pour l'API
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

};
export const getAllAgents = async (req: Request, res: Response) => {
    try {
        // Récupération de tous les agents
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
