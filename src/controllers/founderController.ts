import { Request, Response } from 'express';
import { AgentModel } from '../models/Agent';
import { AnnouncementModel } from '../models/Announcement';
import { IAnnouncement } from '../types/announcement';
import { agentService } from '../services/agentService';
import { IAgent } from '../types/agent';

/**
 * Obtient des statistiques détaillées sur tous les agents
 */
export const getAgentStats = async (req: Request, res: Response) => {
    try {
        // Récupération de tous les agents
        const agents = await AgentModel.find().lean();

        // Statistiques par groupe
        const groupStats = {
            PROTOCOL: 0,
            AURORA: 0,
            ZENITH: 0,
            NONE: 0
        };

        // Statistiques par espèce
        const speciesStats = {
            HUMAN: 0,
            EXO: 0,
            AWOKEN: 0
        };

        // Statistiques par rôle
        const roleStats = {
            AGENT: 0,
            SPECIALIST: 0,
            FOUNDER: 0
        };

        // Dates pour les statistiques d'activité
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        // Statistiques d'activité
        const activityStats = {
            activeToday: 0,
            activeThisWeek: 0,
            activeThisMonth: 0,
            inactive: 0
        };

        // Calcul des statistiques
        agents.forEach(agent => {
            // Groupe
            if (agent.protocol.group) {
                const group = agent.protocol.group as 'PROTOCOL' | 'AURORA' | 'ZENITH';
                groupStats[group]++;
            } else {
                groupStats.NONE++;
            }

            // Espèce
            if (agent.protocol.species) {
                const species = agent.protocol.species as 'HUMAN' | 'EXO' | 'AWOKEN';
                speciesStats[species]++;
            }

            // Rôle
            if (agent.protocol.role) {
                const role = agent.protocol.role as 'AGENT' | 'SPECIALIST' | 'FOUNDER';
                roleStats[role]++;
            }

            // Activité
            if (agent.lastActivity) {
                const lastActivity = new Date(agent.lastActivity);
                const timeDiff = now.getTime() - lastActivity.getTime();

                if (timeDiff < oneDay) {
                    activityStats.activeToday++;
                } else if (timeDiff < oneWeek) {
                    activityStats.activeThisWeek++;
                } else if (timeDiff < oneMonth) {
                    activityStats.activeThisMonth++;
                } else {
                    activityStats.inactive++;
                }
            } else {
                activityStats.inactive++;
            }
        });

        // Construction de la réponse
        const stats = {
            totalAgents: agents.length,
            groups: groupStats,
            species: speciesStats,
            roles: roleStats,
            activity: activityStats,
            timestamp: now
        };

        return res.json({
            success: true,
            data: stats,
            message: "Statistiques des agents récupérées avec succès"
        });
    } catch (error: any) {
        console.error('❌ Error fetching agent stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch agent statistics',
            message: error.message
        });
    }
};

/**
 * Crée une annonce globale pour tous les agents
 */
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, priority, expiresAt, status, tags, visibility, targetGroup } = req.body;

        // Validation des données
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Title and content are required for announcements'
            });
        }

        // Validation de la visibilité GROUP et du groupe cible
        if (visibility === 'GROUP' && !targetGroup) {
            return res.status(400).json({
                success: false,
                error: 'Missing target group',
                message: 'Target group is required when visibility is set to GROUP'
            });
        }

        // Création de la nouvelle annonce
        const announcement = new AnnouncementModel({
            title,
            content,
            createdBy: req.user?.agentId,
            priority: priority || 'MEDIUM',
            status: status || 'PUBLISHED',
            tags: tags || [],
            visibility: visibility || 'ALL',
            targetGroup: targetGroup
        });

        // Configurer la date d'expiration si fournie
        if (expiresAt) {
            announcement.expiresAt = new Date(expiresAt);
        }

        // Sauvegarder l'annonce
        await announcement.save();

        return res.status(201).json({
            success: true,
            data: {
                announcement: {
                    _id: announcement._id,
                    title: announcement.title,
                    content: announcement.content,
                    priority: announcement.priority,
                    status: announcement.status,
                    createdAt: announcement.createdAt,
                    expiresAt: announcement.expiresAt,
                    visibility: announcement.visibility,
                    targetGroup: announcement.targetGroup
                }
            },
            message: 'Announcement created successfully'
        });
    } catch (error: any) {
        console.error('❌ Error creating announcement:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create announcement',
            message: error.message
        });
    }
};

/**
 * Récupère les journaux d'activité des agents
 */
export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Filtres
        const agentId = req.query.agentId as string;
        const activityType = req.query.type as string;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        // Logique de récupération des logs à implémenter
        // (Nécessiterait un modèle ActivityLog dans la base de données)

        return res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'This feature is coming soon'
        });
    } catch (error: any) {
        console.error('❌ Error fetching activity logs:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch activity logs',
            message: error.message
        });
    }
};

/**
 * Récupère les journaux d'authentification
 */
export const getAuthLogs = async (req: Request, res: Response) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Filtres
        const agentId = req.query.agentId as string;
        const status = req.query.status as string; // success, failure
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        // Logique de récupération des logs à implémenter
        // (Nécessiterait un modèle AuthLog dans la base de données)

        return res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'This feature is coming soon'
        });
    } catch (error: any) {
        console.error('❌ Error fetching auth logs:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch authentication logs',
            message: error.message
        });
    }
};

/**
 * Récupère l'état actuel du système Protocol
 */
export const getSystemStatus = async (req: Request, res: Response) => {
    try {
        // Récupérer diverses métriques du système
        const agentsCount = await AgentModel.countDocuments();

        // Exemple d'informations système
        const systemInfo = {
            version: '1.0.0',
            status: 'operational',
            maintenance: false,
            databaseStatus: 'connected',
            apiStatus: 'healthy',
            metrics: {
                totalAgents: agentsCount,
                activeConnections: 0, // À implémenter
                averageResponseTime: '120ms', // À implémenter
                cpuUsage: '23%', // À implémenter
                memoryUsage: '512MB' // À implémenter
            },
            lastRestart: new Date(Date.now() - 3600000 * 24 * 3), // Exemple: redémarré il y a 3 jours
            uptime: '3 days, 2 hours, 15 minutes'
        };

        return res.json({
            success: true,
            data: systemInfo,
            message: "État du système récupéré avec succès"
        });
    } catch (error: any) {
        console.error('❌ Error fetching system status:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch system status',
            message: error.message
        });
    }
};

/**
 * Met le système en mode maintenance ou effectue d'autres opérations d'administration
 */
export const updateSystemMaintenance = async (req: Request, res: Response) => {
    try {
        const { maintenance, message, estimatedDuration } = req.body;

        if (maintenance === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Maintenance status is required'
            });
        }

        // Logique de mise en maintenance à implémenter
        // (Nécessiterait probablement une collection de configuration système)

        return res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'This feature is coming soon'
        });
    } catch (error: any) {
        console.error('❌ Error updating system maintenance:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update system maintenance',
            message: error.message
        });
    }
};

/**
 * Promeut un agent (augmente son rôle ou son niveau d'autorisation)
 */
export const promoteAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { newRole, newClearanceLevel } = req.body;

        // Validation des données
        if (!newRole && !newClearanceLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'New role or clearance level is required'
            });
        }

        // Vérification que l'agent existe
        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                message: 'Agent profile could not be found'
            });
        }

        // Création des données de mise à jour
        const updateData: Partial<IAgent> = {};

        // Initialisation de l'objet protocol avec les valeurs existantes
        updateData.protocol = {
            agentName: existingAgent.protocol.agentName,
            species: existingAgent.protocol.species,
            role: existingAgent.protocol.role,
            clearanceLevel: existingAgent.protocol.clearanceLevel,
            hasSeenRecruitment: existingAgent.protocol.hasSeenRecruitment,
            settings: { ...existingAgent.protocol.settings }
        };

        // Mise à jour du rôle si fourni
        if (newRole && ['AGENT', 'SPECIALIST', 'FOUNDER'].includes(newRole)) {
            updateData.protocol.role = newRole as 'AGENT' | 'SPECIALIST' | 'FOUNDER';
        }

        // Mise à jour du niveau d'autorisation si fourni
        if (newClearanceLevel && [1, 2, 3].includes(newClearanceLevel)) {
            updateData.protocol.clearanceLevel = newClearanceLevel;
        }

        // Effectue la mise à jour
        const updatedAgent = await agentService.updateAgentProfile(agentId, updateData);

        if (!updatedAgent) {
            return res.status(500).json({
                success: false,
                error: 'Promotion failed',
                message: 'Failed to promote agent'
            });
        }

        return res.json({
            success: true,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    protocol: {
                        agentName: updatedAgent.protocol.agentName,
                        role: updatedAgent.protocol.role,
                        clearanceLevel: updatedAgent.protocol.clearanceLevel
                    }
                }
            },
            message: `Agent ${updatedAgent.protocol.agentName} has been promoted to ${updatedAgent.protocol.role} with clearance level ${updatedAgent.protocol.clearanceLevel}`
        });
    } catch (error: any) {
        console.error('❌ Error promoting agent:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to promote agent',
            message: error.message
        });
    }
};
/**
 * Permet à un administrateur de mettre à jour n'importe quel champ d'un agent
 * Cette route devrait être protégée par un middleware d'authentification admin
 */
export const adminUpdateAgent = async (req: Request, res: Response) => {
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

        // Vérification que l'agent existe
        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found',
                message: 'Agent profile could not be found'
            });
        }

        // Les administrateurs peuvent uniquement mettre à jour l'objet protocol
        const sanitizedData: Partial<IAgent> = {};

        // On ne permet que la modification de l'objet protocol
        if (updateData.protocol) {
            // Initialiser sanitizedData.protocol avec les valeurs existantes
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

            // Mettre à jour avec les nouvelles valeurs
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

            // Mettre à jour les paramètres
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

        // Mise à jour de l'agent
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