import { Request, Response } from 'express';
import { AgentModel } from '../models/Agent.model';
import { AnnouncementModel } from '../models/Announcement.model';
import { agentService } from '../services/agentService';
import { IAgent } from '../types/agent';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { AppInfoService } from '../services/appInfoService';
import { getMongoConfig } from '../utils/environment';
import { MongoClient } from 'mongodb';


export const getAgentStats = async (req: Request, res: Response) => {
    try {
        const agents = await AgentModel.find().lean();

        const groupStats = {
            PROTOCOL: 0,
            AURORA: 0,
            ZENITH: 0,
            NONE: 0
        };

        const speciesStats = {
            HUMAN: 0,
            EXO: 0,
            AWOKEN: 0
        };

        const roleStats = {
            AGENT: 0,
            SPECIALIST: 0,
            FOUNDER: 0
        };

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        const activityStats = {
            activeToday: 0,
            activeThisWeek: 0,
            activeThisMonth: 0,
            inactive: 0
        };

        agents.forEach(agent => {
            if (agent.protocol.group) {
                const group = agent.protocol.group as 'PROTOCOL' | 'AURORA' | 'ZENITH';
                groupStats[group]++;
            } else {
                groupStats.NONE++;
            }

            if (agent.protocol.species) {
                const species = agent.protocol.species as 'HUMAN' | 'EXO' | 'AWOKEN';
                speciesStats[species]++;
            }

            if (agent.protocol.role) {
                const role = agent.protocol.role as 'AGENT' | 'SPECIALIST' | 'FOUNDER';
                roleStats[role]++;
            }

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

export const getSystemStatus = async (req: Request, res: Response) => {
    try {
        const appInfoService = AppInfoService.getInstance();
        const appInfo = appInfoService.getAppInfo();

        const [agentsCount, announcementsCount] = await Promise.all([
            AgentModel.countDocuments(),
            AnnouncementModel.countDocuments()
        ]);

        const { uri, dbName } = getMongoConfig();
        let dbStatus = {
            connected: false,
            name: dbName,
            responseTime: 0,
            error: undefined
        };

        let client: MongoClient | null = null;
        try {
            const dbStartTime = Date.now();
            client = new MongoClient(uri);
            await client.connect();
            await client.db(dbName).command({ ping: 1 });
            const dbResponseTime = Date.now() - dbStartTime;

            dbStatus = {
                connected: true,
                name: dbName,
                responseTime: dbResponseTime,
                error: undefined
            };
        } catch (error: any) {
            dbStatus = {
                connected: false,
                name: dbName,
                responseTime: 0,
                error: error.message
            };
        } finally {
            if (client) await client.close();
        }

        const memoryUsage = process.memoryUsage();
        const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

        const cpuStartUsage = process.cpuUsage();
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, 100));

        const cpuEndUsage = process.cpuUsage(cpuStartUsage);
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        const cpuPercent = (100 * (cpuEndUsage.user + cpuEndUsage.system) / 1000 / elapsedTime).toFixed(1);

        const systemInfo = {
            service: {
                name: appInfo.name,
                version: appInfo.version,
                description: appInfo.description,
                environment: appInfo.environment,
                uptime: appInfo.uptime
            },
            status: {
                overall: dbStatus.connected ? 'operational' : 'degraded',
                maintenance: false,
                components: {
                    api: 'healthy',
                    database: dbStatus.connected ? 'connected' : 'error',
                    cache: 'operational'
                }
            },
            performance: {
                cpu: {
                    usage: `${cpuPercent}%`,
                    cores: require('os').cpus().length
                },
                memory: {
                    total: formatMemory(require('os').totalmem()),
                    free: formatMemory(require('os').freemem()),
                    used: {
                        rss: formatMemory(memoryUsage.rss),
                        heapTotal: formatMemory(memoryUsage.heapTotal),
                        heapUsed: formatMemory(memoryUsage.heapUsed),
                        external: formatMemory(memoryUsage.external || 0)
                    }
                },
                database: {
                    responseTime: `${dbStatus.responseTime}ms`,
                    connected: dbStatus.connected
                }
            },
            metrics: {
                totalAgents: agentsCount,
                totalAnnouncements: announcementsCount,
                activeAgentsToday: await AgentModel.countDocuments({
                    lastActivity: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }),
                activeAgentsWeek: await AgentModel.countDocuments({
                    lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                })
            }
        };

        return ApiResponseBuilder.success(res, {
            message: "État du système récupéré avec succès",
            data: systemInfo
        });
    } catch (error: any) {
        console.error('❌ Error fetching system status:', error);
        return ApiResponseBuilder.error(res, 500, {
            message: "Échec de récupération de l'état du système",
            error: 'system_status_error',
            details: error.message
        });
    }
};

export const updateSystemMaintenance = async (req: Request, res: Response) => {
    try {
        const { maintenance, message, estimatedDuration } = req.body;

        if (maintenance === undefined) {
            return ApiResponseBuilder.badRequest(res, {
                message: 'Paramètres requis manquants',
                error: 'missing_required_fields',
                details: 'Le statut de maintenance est requis'
            });
        }

        // NOTE: Ceci est un emplacement où vous implémenteriez la logique réelle
        // de mise en maintenance. Comme elle n'est pas encore implémentée,
        // nous retournons une réponse plus informative.

        // Une approche possible serait de créer une collection "SystemSettings"
        // dans la base de données pour stocker ces paramètres.

        const maintenanceInfo = {
            status: maintenance,
            message: message || 'Maintenance planifiée du système',
            estimatedDuration: estimatedDuration || '1 heure',
            startedAt: new Date(),
            estimatedEndAt: new Date(Date.now() + (parseInt(estimatedDuration) || 60) * 60 * 1000)
        };

        return ApiResponseBuilder.success(res, {
            message: 'Cette fonctionnalité sera bientôt disponible',
            data: {
                maintenanceInfo,
                implementation: 'Cette fonctionnalité n\'est pas encore implémentée. Voici les données qui seraient traitées.'
            }
        });
    } catch (error: any) {
        console.error('❌ Error updating system maintenance:', error);
        return ApiResponseBuilder.error(res, 500, {
            message: 'Échec de la mise à jour du statut de maintenance',
            error: 'maintenance_update_error',
            details: error.message
        });
    }
};

export const promoteAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { newRole, newClearanceLevel } = req.body;

        if (!newRole && !newClearanceLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'New role or clearance level is required'
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

        const updateData: Partial<IAgent> = {};

        updateData.protocol = {
            agentName: existingAgent.protocol.agentName,
            species: existingAgent.protocol.species,
            role: existingAgent.protocol.role,
            clearanceLevel: existingAgent.protocol.clearanceLevel,
            hasSeenRecruitment: existingAgent.protocol.hasSeenRecruitment,
            settings: { ...existingAgent.protocol.settings }
        };

        if (newRole && ['AGENT', 'SPECIALIST', 'FOUNDER'].includes(newRole)) {
            updateData.protocol.role = newRole as 'AGENT' | 'SPECIALIST' | 'FOUNDER';
        }

        if (newClearanceLevel && [1, 2, 3].includes(newClearanceLevel)) {
            updateData.protocol.clearanceLevel = newClearanceLevel;
        }

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