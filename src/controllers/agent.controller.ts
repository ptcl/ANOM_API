import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { AgentModel } from '../models/agent.model';
import { IAgent } from '../types/agent';
import { AgentServiceStats } from '../types/services';

export const getAgentByMembership = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;

        // Validation robuste des paramètres
        if (!membershipType || !membershipId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        // Validation du format membershipType (doit être un nombre entre 1-5 pour Bungie)
        const parsedMembershipType = parseInt(membershipType);
        if (isNaN(parsedMembershipType) || parsedMembershipType < 1 || parsedMembershipType > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        // Validation du format membershipId (doit être numérique pour Bungie)
        if (!/^\d+$/.test(membershipId) || membershipId.length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        const agent = await agentService.getAgentByDestinyMembership(
            parsedMembershipType,
            membershipId
        );

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        // Vérifier si l'agent cible a un profil public ou si le demandeur est fondateur
        const isFounder = req.user?.protocol?.role?.toUpperCase() === 'FOUNDER';
        const isPublicProfile = agent.protocol?.settings?.publicProfile !== false; // Par défaut public
        
        if (!isFounder && !isPublicProfile) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found' // Ne pas révéler que l'agent existe mais est privé
            });
        }

        // Formater les données selon les permissions
        let formattedAgent;
        
        if (isFounder) {
            // Fondateurs voient toutes les informations
            formattedAgent = {
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
        } else {
            // Agents normaux voient un profil public limité
            formattedAgent = {
                protocol: {
                    agentName: agent.protocol.agentName,
                    customName: agent.protocol.customName,
                    species: agent.protocol.species,
                    role: agent.protocol.role,
                    group: agent.protocol.group,
                    protocolJoinedAt: agent.protocol.protocolJoinedAt
                },
                bungieUser: agent.bungieUser ? {
                    displayName: agent.bungieUser.displayName,
                    profilePicturePath: agent.bungieUser.profilePicturePath
                } : null,
                // Pas d'informations sensibles pour les agents normaux
                joinedAt: agent.createdAt
            };
        }

        return res.json({
            success: true,
            data: {
                agent: formattedAgent
            },
            message: 'Agent profile retrieved successfully'
        });
    } catch (error: any) {
        // Log sécurisé sans exposer d'informations sensibles
        console.error('Agent lookup error:', {
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

export const updateAgentByMembership = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;

        if (!membershipType || !membershipId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        // Validation du format membershipType
        const parsedMembershipType = parseInt(membershipType);
        if (isNaN(parsedMembershipType) || parsedMembershipType < 1 || parsedMembershipType > 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        // Validation du format membershipId
        if (!/^\d+$/.test(membershipId) || membershipId.length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        // Vérification des permissions - seuls les fondateurs peuvent modifier les profils d'autres agents
        if (req.user?.protocol?.role?.toUpperCase() !== 'FOUNDER') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }

        const agent = await agentService.getAgentByDestinyMembership(
            parsedMembershipType,
            membershipId
        );

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        return res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'This endpoint is not yet implemented'
        });
    } catch (error: any) {
        console.error('Agent update error:', {
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

export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const agent = await agentService.getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
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
            message: 'Profile retrieved successfully'
        });
    } catch (error: any) {
        console.error('Profile fetch error:', {
            timestamp: new Date().toISOString(),
            agentId: req.user?.agentId,
            ip: req.ip
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
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
                error: 'Unauthorized'
            });
        }

        // Validation de base du payload
        if (!updateData || typeof updateData !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid payload'
            });
        }

        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
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

            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                sanitizedData.protocol.hasSeenRecruitment = !!updateData.protocol.hasSeenRecruitment;
            }
            if (updateData.protocol.customName !== undefined) {
                // Validation du customName
                if (typeof updateData.protocol.customName === 'string' && 
                    updateData.protocol.customName.length <= 50 && 
                    updateData.protocol.customName.trim().length > 0) {
                    sanitizedData.protocol.customName = updateData.protocol.customName.trim();
                } else if (updateData.protocol.customName === null || updateData.protocol.customName === '') {
                    sanitizedData.protocol.customName = undefined; // Permet de supprimer le custom name
                }
                // Ignore les valeurs invalides (pas d'erreur, juste pas de mise à jour)
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
            timestamp: new Date().toISOString(),
            agentId: req.user?.agentId,
            ip: req.ip
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAllAgents = async (req: Request, res: Response) => {
    try {
        // Récupérer uniquement les agents avec profil public ou sans restriction de confidentialité
        const agents = await AgentModel.find({
            $or: [
                { 'protocol.settings.publicProfile': true },
                { 'protocol.settings.publicProfile': { $exists: false } } // Par défaut public si non défini
            ]
        }).lean();

        // Formater les données pour l'affichage public (informations limitées et sécurisées)
        const formattedAgents = agents.map(agent => ({
            protocol: {
                agentName: agent.protocol.agentName || 'Agent Inconnu',
                customName: agent.protocol.customName || null,
                species: agent.protocol.species || 'UNKNOWN',
                role: agent.protocol.role || 'AGENT',
                group: agent.protocol.group || null
            },
            // Pas d'ID, bungieId ou dates sensibles pour la liste publique
            joinedAt: agent.protocol.protocolJoinedAt || agent.createdAt
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
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Récupère les statistiques des agents (réservé aux fondateurs)
 */
export const getAgentStatistics = async (req: Request, res: Response) => {
    try {
        // Vérification des permissions (seuls les fondateurs peuvent voir les stats)
        if (req.user?.protocol?.role !== 'FOUNDER') {
            return res.status(403).json({
                success: false,
                error: 'Access denied - Founders only'
            });
        }

        const now = new Date();
        
        // Utilisation du service pour récupérer les statistiques
        const stats = await agentService.getAgentStatistics();

        // Log de l'accès aux statistiques pour audit
        console.log('Agent statistics accessed:', {
            timestamp: new Date().toISOString(),
            founderId: req.user?.agentId,
            ip: req.ip,
            stats
        });

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
            timestamp: new Date().toISOString(),
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



