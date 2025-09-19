import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { IAgent } from '../types/agent';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { formatForUser } from '../utils';


export const FounderUpdateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        // Validation de l'agentId
        if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'ID d\'agent invalide ou manquant',
                error: 'validation_error'
            });
        }

        // Validation des données de mise à jour
        if (!updateData || typeof updateData !== 'object') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Données de mise à jour invalides',
                error: 'validation_error'
            });
        }

        // Vérification de l'existence de l'agent
        const existingAgent = await agentService.getAgentById(agentId);
        if (!existingAgent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Profil d\'agent non trouvé',
                error: 'not_found'
            });
        }

        // Log de sécurité pour l'audit
        console.log('Founder update agent request:', {
            agentId,
            targetAgent: existingAgent.protocol?.agentName || 'unknown',
            founderAgentId: (req as any).user?.agentId || 'unknown',
            timestamp: formatForUser(),
            fieldsToUpdate: Object.keys(updateData)
        });

        // Préparation des données sécurisées
        const sanitizedData: Partial<IAgent> = {};

        // Validation et sanitisation du protocole
        if (updateData.protocol && typeof updateData.protocol === 'object') {
            // Vérification que le protocole existe sur l'agent existant
            if (!existingAgent.protocol) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'L\'agent n\'a pas de protocole configuré',
                    error: 'invalid_state'
                });
            }

            // Initialisation sécurisée du protocole
            sanitizedData.protocol = {
                agentName: existingAgent.protocol.agentName,
                customName: existingAgent.protocol.customName,
                species: existingAgent.protocol.species,
                role: existingAgent.protocol.role,
                clearanceLevel: existingAgent.protocol.clearanceLevel,
                hasSeenRecruitment: existingAgent.protocol.hasSeenRecruitment,
                protocolJoinedAt: existingAgent.protocol.protocolJoinedAt,
                group: existingAgent.protocol.group,
                settings: {
                    notifications: existingAgent.protocol.settings?.notifications ?? false,
                    publicProfile: existingAgent.protocol.settings?.publicProfile ?? false,
                    protocolOSTheme: existingAgent.protocol.settings?.protocolOSTheme,
                    protocolSounds: existingAgent.protocol.settings?.protocolSounds
                }
            };

            // Validation et mise à jour sécurisée de l'agentName
            if (updateData.protocol.agentName !== undefined) {
                if (typeof updateData.protocol.agentName !== 'string' || updateData.protocol.agentName.trim().length === 0) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom d\'agent ne peut pas être vide',
                        error: 'validation_error'
                    });
                }
                if (updateData.protocol.agentName.length > 50) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom d\'agent ne peut pas dépasser 50 caractères',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.agentName = updateData.protocol.agentName.trim();
            }

            // Validation et mise à jour du customName
            if (updateData.protocol.customName !== undefined) {
                if (updateData.protocol.customName && (typeof updateData.protocol.customName !== 'string' || updateData.protocol.customName.length > 50)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom personnalisé ne peut pas dépasser 50 caractères',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.customName = updateData.protocol.customName?.trim() || undefined;
            }

            // Validation des espèces
            if (updateData.protocol.species !== undefined) {
                const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                if (!allowedSpecies.includes(updateData.protocol.species)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Espèce invalide. Doit être HUMAN, EXO ou AWOKEN',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.species = updateData.protocol.species;
            }

            // Validation des rôles
            if (updateData.protocol.role !== undefined) {
                const allowedRoles = ['AGENT', 'SPECIALIST', 'FOUNDER'];
                if (!allowedRoles.includes(updateData.protocol.role)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Rôle invalide. Doit être AGENT, SPECIALIST ou FOUNDER',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.role = updateData.protocol.role;
            }

            // Validation du niveau d'autorisation
            if (updateData.protocol.clearanceLevel !== undefined) {
                if (typeof updateData.protocol.clearanceLevel !== 'number' || updateData.protocol.clearanceLevel < 0 || updateData.protocol.clearanceLevel > 10) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Niveau d\'autorisation invalide (0-10)',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.clearanceLevel = updateData.protocol.clearanceLevel;
            }

            // Validation des booléens
            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                if (typeof updateData.protocol.hasSeenRecruitment !== 'boolean') {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'hasSeenRecruitment doit être un booléen',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.hasSeenRecruitment = updateData.protocol.hasSeenRecruitment;
            }

            // Validation des dates
            if (updateData.protocol.protocolJoinedAt !== undefined) {
                const joinDate = new Date(updateData.protocol.protocolJoinedAt);
                if (isNaN(joinDate.getTime())) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Date d\'adhésion au protocole invalide',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.protocolJoinedAt = joinDate;
            }

            // Validation du groupe
            if (updateData.protocol.group !== undefined) {
                if (updateData.protocol.group && (typeof updateData.protocol.group !== 'string' || updateData.protocol.group.length > 100)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le groupe ne peut pas dépasser 100 caractères',
                        error: 'validation_error'
                    });
                }
                sanitizedData.protocol!.group = updateData.protocol.group?.trim() || undefined;
            }

            // Validation des paramètres
            if (updateData.protocol.settings && typeof updateData.protocol.settings === 'object') {
                if (updateData.protocol.settings.notifications !== undefined) {
                    if (typeof updateData.protocol.settings.notifications !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'notifications doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    sanitizedData.protocol!.settings.notifications = updateData.protocol.settings.notifications;
                }
                
                if (updateData.protocol.settings.publicProfile !== undefined) {
                    if (typeof updateData.protocol.settings.publicProfile !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'publicProfile doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    sanitizedData.protocol!.settings.publicProfile = updateData.protocol.settings.publicProfile;
                }
                
                if (updateData.protocol.settings.protocolOSTheme !== undefined) {
                    const allowedThemes = ['DEFAULT', 'DARKNESS'];
                    if (!allowedThemes.includes(updateData.protocol.settings.protocolOSTheme)) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Thème invalide. Doit être DEFAULT ou DARKNESS',
                            error: 'validation_error'
                        });
                    }
                    sanitizedData.protocol!.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme;
                }
                
                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    if (typeof updateData.protocol.settings.protocolSounds !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'protocolSounds doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    sanitizedData.protocol!.settings.protocolSounds = updateData.protocol.settings.protocolSounds;
                }
            }
        }

        // Validation qu'au moins un champ a été modifié
        if (Object.keys(sanitizedData).length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Aucune donnée valide à mettre à jour',
                error: 'no_changes'
            });
        }

        // Mise à jour sécurisée
        const updatedAgent = await agentService.updateAgentProfile(agentId, sanitizedData);

        if (!updatedAgent) {
            console.error('Failed to update agent profile:', {
                agentId,
                sanitizedData,
                timestamp: formatForUser()
            });
            
            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la mise à jour du profil d\'agent',
                error: 'update_failed'
            });
        }

        // Log de succès pour l'audit
        console.log('Agent profile updated successfully:', {
            agentId,
            updatedBy: (req as any).user?.agentId || 'unknown',
            updatedFields: Object.keys(sanitizedData),
            timestamp: formatForUser()
        });

        // Réponse sécurisée avec données filtrées
        return res.status(200).json({
            success: true,
            message: `Profil de l'agent ${updatedAgent.protocol?.agentName || agentId} mis à jour avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    protocol: {
                        agentName: updatedAgent.protocol?.agentName,
                        customName: updatedAgent.protocol?.customName,
                        species: updatedAgent.protocol?.species,
                        role: updatedAgent.protocol?.role,
                        clearanceLevel: updatedAgent.protocol?.clearanceLevel,
                        hasSeenRecruitment: updatedAgent.protocol?.hasSeenRecruitment,
                        protocolJoinedAt: updatedAgent.protocol?.protocolJoinedAt,
                        group: updatedAgent.protocol?.group,
                        settings: updatedAgent.protocol?.settings
                    },
                    lastActivity: updatedAgent.lastActivity,
                    updatedAt: updatedAgent.updatedAt
                }
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'agent par le founder:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};