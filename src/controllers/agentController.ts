import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';
import { agentService } from '../services/agentService';
import { AgentModel } from '../models/Agent';


/**
 * Récupère le profil du joueur connecté
 */
export const getAgentByMembership = (req: Request, res: Response) => {
    const { membershipType, membershipId } = req.params;

    // Logique métier ici

    res.json({
        success: true,
        message: 'Protocol data access',
        data: {
            membershipType,
            membershipId,
            protocol: {
                id: 'sample-id',
                level: 1,
                isActive: true,
                updatedAt: new Date().toISOString()
            }
        }
    });
};

export const updateAgentByMembership = (req: Request, res: Response) => {
    // Implémentation
};
export const getAllAgents = async (req: Request, res: Response) => {
    try {
        // Récupération de tous les agents
        const agents = await AgentModel.find().lean();

        // Formatage des données pour l'API (version simplifiée)
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
