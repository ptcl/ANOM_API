import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { IAgent } from '../types/agent';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { formatForUser } from '../utils';
import { findAgentByIdentifier, validateIdentifier } from '../utils/verifyAgent.helper';
import { Agent } from '../models/agent.model';

export const FounderUpdateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        // Validation de l'agentId avec le helper
        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide ou manquant',
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

        // Utiliser le helper pour trouver l'agent (supporte MongoDB ID, bungieId, uniqueName)
        const existingAgent = await findAgentByIdentifier(agentId);
        if (!existingAgent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Profil d\'agent non trouvé',
                error: 'not_found'
            });
        }

        // Log de sécurité pour l'audit
        console.log('Founder update agent request:', {
            agentId: existingAgent._id?.toString(),
            bungieId: existingAgent.bungieId,
            uniqueName: existingAgent.bungieUser?.uniqueName,
            targetAgent: existingAgent.protocol?.agentName || 'unknown',
            founderAgentId: (req as any).user?.agentId || 'unknown',
            timestamp: formatForUser(),
            fieldsToUpdate: Object.keys(updateData),
            identifierUsed: agentId,
            identifierType: validation.type
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

            // Créer un objet partiel pour les mises à jour du protocole
            const protocolUpdates: any = {};

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
                protocolUpdates.agentName = updateData.protocol.agentName.trim();
            }

            // Validation et mise à jour du customName
            if (updateData.protocol.customName !== undefined) {
                if (updateData.protocol.customName && (typeof updateData.protocol.customName !== 'string' || updateData.protocol.customName.length > 50)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Le nom personnalisé ne peut pas dépasser 50 caractères',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.customName = updateData.protocol.customName?.trim() || undefined;
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
                protocolUpdates.species = updateData.protocol.species;
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
                protocolUpdates.role = updateData.protocol.role;
            }

            // Validation du niveau d'autorisation
            if (updateData.protocol.clearanceLevel !== undefined) {
                if (typeof updateData.protocol.clearanceLevel !== 'number' || updateData.protocol.clearanceLevel < 0 || updateData.protocol.clearanceLevel > 10) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Niveau d\'autorisation invalide (0-10)',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.clearanceLevel = updateData.protocol.clearanceLevel;
            }

            // Validation des booléens
            if (updateData.protocol.hasSeenRecruitment !== undefined) {
                if (typeof updateData.protocol.hasSeenRecruitment !== 'boolean') {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'hasSeenRecruitment doit être un booléen',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.hasSeenRecruitment = updateData.protocol.hasSeenRecruitment;
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
                protocolUpdates.protocolJoinedAt = joinDate;
            }

            // Validation du groupe
            if (updateData.protocol.group !== undefined) {
                const allowedGroups = ['PROTOCOL', 'AURORA', 'ZENITH'];
                if (!allowedGroups.includes(updateData.protocol.group)) {
                    return ApiResponseBuilder.error(res, 400, {
                        message: 'Groupe invalide. Doit être PROTOCOL, AURORA ou ZENITH',
                        error: 'validation_error'
                    });
                }
                protocolUpdates.group = updateData.protocol.group;
            }

            // Validation des paramètres
            if (updateData.protocol.settings && typeof updateData.protocol.settings === 'object') {
                protocolUpdates.settings = {};

                if (updateData.protocol.settings.notifications !== undefined) {
                    if (typeof updateData.protocol.settings.notifications !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'notifications doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.notifications = updateData.protocol.settings.notifications;
                }

                if (updateData.protocol.settings.publicProfile !== undefined) {
                    if (typeof updateData.protocol.settings.publicProfile !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'publicProfile doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.publicProfile = updateData.protocol.settings.publicProfile;
                }

                if (updateData.protocol.settings.protocolOSTheme !== undefined) {
                    const allowedThemes = ['DEFAULT', 'DARKNESS'];
                    if (!allowedThemes.includes(updateData.protocol.settings.protocolOSTheme)) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Thème invalide. Doit être DEFAULT ou DARKNESS',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.protocolOSTheme = updateData.protocol.settings.protocolOSTheme;
                }

                if (updateData.protocol.settings.protocolSounds !== undefined) {
                    if (typeof updateData.protocol.settings.protocolSounds !== 'boolean') {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'protocolSounds doit être un booléen',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.protocolSounds = updateData.protocol.settings.protocolSounds;
                }

                if (updateData.protocol.settings.language !== undefined) {
                    if (typeof updateData.protocol.settings.language !== 'string' || updateData.protocol.settings.language.length > 10) {
                        return ApiResponseBuilder.error(res, 400, {
                            message: 'Langue invalide',
                            error: 'validation_error'
                        });
                    }
                    protocolUpdates.settings.language = updateData.protocol.settings.language.trim();
                }
            }

            // Seulement si des champs protocol ont été modifiés
            if (Object.keys(protocolUpdates).length > 0) {
                sanitizedData.protocol = protocolUpdates;
            }
        }

        // Validation qu'au moins un champ a été modifié
        if (Object.keys(sanitizedData).length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Aucune donnée valide à mettre à jour',
                error: 'no_changes'
            });
        }

        // Convertir les champs imbriqués en notation "dot" pour Mongoose
        const flattenedData: any = {};

        if (sanitizedData.protocol) {
            for (const [key, value] of Object.entries(sanitizedData.protocol)) {
                if (key === 'settings' && typeof value === 'object' && value !== null) {
                    // Aplatir les settings aussi
                    for (const [settingKey, settingValue] of Object.entries(value)) {
                        flattenedData[`protocol.settings.${settingKey}`] = settingValue;
                    }
                } else {
                    flattenedData[`protocol.${key}`] = value;
                }
            }
        }

        // Ajouter les autres champs (non-protocol) s'il y en a
        for (const [key, value] of Object.entries(sanitizedData)) {
            if (key !== 'protocol') {
                flattenedData[key] = value;
            }
        }

        console.log('Flattened update data:', {
            original: sanitizedData,
            flattened: flattenedData,
            timestamp: formatForUser()
        });

        // Mise à jour sécurisée (utiliser le vrai MongoDB _id)
        const updatedAgent = await agentService.updateAgentProfile(
            existingAgent._id!.toString(),
            flattenedData // ✅ Correct maintenant
        );

        if (!updatedAgent) {
            console.error('Failed to update agent profile:', {
                agentId: existingAgent._id?.toString(),
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
            agentId: updatedAgent._id?.toString(),
            bungieId: updatedAgent.bungieId,
            uniqueName: updatedAgent.bungieUser?.uniqueName,
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

export const FounderDeleteAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { confirm } = req.body; // Optionnel : nécessiter une confirmation

        // Validation de l'agentId avec le helper
        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide ou manquant',
                error: 'validation_error'
            });
        }

        // Trouver l'agent à supprimer
        const agentToDelete = await findAgentByIdentifier(agentId);
        if (!agentToDelete) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Profil d\'agent non trouvé',
                error: 'not_found'
            });
        }

        // Empêcher l'auto-suppression (optionnel)
        const founderAgentId = (req as any).user?.agentId;
        if (founderAgentId && agentToDelete._id?.toString() === founderAgentId) {
            console.warn('Founder attempted to delete own account:', {
                founderAgentId,
                timestamp: formatForUser()
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'Vous ne pouvez pas supprimer votre propre compte',
                error: 'self_deletion_forbidden'
            });
        }

        // Sécurité supplémentaire : empêcher la suppression d'autres FOUNDERS (optionnel)
        if (agentToDelete.protocol?.role === 'FOUNDER') {
            console.warn('Attempt to delete another FOUNDER account:', {
                targetAgentId: agentToDelete._id?.toString(),
                targetAgentName: agentToDelete.protocol?.agentName,
                requestedBy: founderAgentId,
                timestamp: formatForUser()
            });

            return ApiResponseBuilder.error(res, 403, {
                message: 'Vous ne pouvez pas supprimer un compte FOUNDER',
                error: 'founder_deletion_forbidden'
            });
        }

        // Optionnel : Nécessiter une confirmation explicite
        if (confirm !== true) {
            return res.status(200).json({
                success: false,
                requiresConfirmation: true,
                message: 'Suppression nécessite une confirmation',
                data: {
                    agent: {
                        _id: agentToDelete._id,
                        bungieId: agentToDelete.bungieId,
                        agentName: agentToDelete.protocol?.agentName,
                        uniqueName: agentToDelete.bungieUser?.uniqueName,
                        role: agentToDelete.protocol?.role,
                        joinedAt: agentToDelete.protocol?.protocolJoinedAt,
                        stats: agentToDelete.protocol?.stats
                    }
                },
                instructions: 'Pour confirmer la suppression, renvoyez la requête avec { "confirm": true } dans le body'
            });
        }

        // Log de sécurité avant suppression
        console.log('⚠️ Agent deletion initiated:', {
            targetAgentId: agentToDelete._id?.toString(),
            bungieId: agentToDelete.bungieId,
            uniqueName: agentToDelete.bungieUser?.uniqueName,
            agentName: agentToDelete.protocol?.agentName,
            role: agentToDelete.protocol?.role,
            deletedBy: founderAgentId,
            timestamp: formatForUser(),
            identifierUsed: agentId,
            identifierType: validation.type
        });

        // Sauvegarder les infos avant suppression pour le log
        const deletedAgentInfo = {
            _id: agentToDelete._id?.toString(),
            bungieId: agentToDelete.bungieId,
            uniqueName: agentToDelete.bungieUser?.uniqueName,
            agentName: agentToDelete.protocol?.agentName,
            displayName: agentToDelete.bungieUser?.displayName,
            role: agentToDelete.protocol?.role,
            clearanceLevel: agentToDelete.protocol?.clearanceLevel,
            group: agentToDelete.protocol?.group,
            joinedAt: agentToDelete.protocol?.protocolJoinedAt,
            totalBadges: agentToDelete.protocol?.badges?.length || 0,
            stats: agentToDelete.protocol?.stats,
            createdAt: agentToDelete.createdAt
        };

        // Supprimer l'agent
        await Agent.findByIdAndDelete(agentToDelete._id);

        // Log de succès pour l'audit
        console.log('✅ Agent deleted successfully:', {
            deletedAgent: deletedAgentInfo,
            deletedBy: founderAgentId,
            timestamp: formatForUser()
        });

        // Réponse de confirmation
        return res.status(200).json({
            success: true,
            message: `Agent ${deletedAgentInfo.agentName || deletedAgentInfo.bungieId} supprimé avec succès`,
            data: {
                deletedAgent: deletedAgentInfo,
                deletedAt: new Date(),
                deletedBy: founderAgentId
            }
        });

    } catch (error: any) {
        console.error('❌ Erreur lors de la suppression de l\'agent:', {
            agentId: req.params.agentId,
            error: error.message,
            stack: error.stack,
            deletedBy: (req as any).user?.agentId,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};


export const FounderAgentStatistics = async (req: Request, res: Response) => {
    try {
        const now = new Date();

        // Utilisation du service pour récupérer les statistiques
        const stats = await agentService.getAgentStatistics();

        // Log de l'accès aux statistiques pour audit
        console.log('Agent statistics accessed:', {
            timestamp: formatForUser(),
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
            timestamp: formatForUser(),
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



export const FounderRepairProfile = async (req: Request, res: Response) => {
    try {
        const requesterId = req.user?.agentId;
        const targetAgentId = req.params.agentId || requesterId;
        const isFounder = req.user?.protocol?.role === 'FOUNDER';

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!targetAgentId) {
            return res.status(400).json({
                success: false,
                error: 'Agent ID required'
            });
        }

        // Vérifier les permissions : propre profil ou fondateur
        if (targetAgentId !== requesterId && !isFounder) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - Can only repair own profile'
            });
        }

        console.log('Profile repair requested:', {
            requesterId,
            targetAgentId,
            isFounder,
            ip: req.ip,
            timestamp: formatForUser()
        });

        const success = await agentService.repairIncompleteProfile(targetAgentId);

        if (success) {
            return res.json({
                success: true,
                message: 'Profile repair completed successfully'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Profile repair failed'
            });
        }

    } catch (error: any) {
        console.error('Profile repair error:', {
            timestamp: formatForUser(),
            requesterId: req.user?.agentId,
            targetAgentId: req.params.agentId,
            error: error.message,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const FounderDeactivateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const { reason } = req.body; // Raison optionnelle de la désactivation

        // Validation de l'agentId
        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide',
                error: 'validation_error'
            });
        }

        // Trouver l'agent
        const agent = await findAgentByIdentifier(agentId);
        if (!agent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Agent non trouvé',
                error: 'not_found'
            });
        }

        // Vérifier si déjà désactivé
        if (agent.isActive === false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Cet agent est déjà désactivé',
                error: 'already_deactivated',
                data: {
                    agentName: agent.protocol?.agentName,
                    deactivatedAt: agent.deactivatedAt
                }
            });
        }

        // Empêcher la désactivation de FOUNDERS
        if (agent.protocol?.role === 'FOUNDER') {
            const founderAgentId = (req as any).user?.agentId;

            // Sauf si c'est lui-même (auto-désactivation)
            if (agent._id?.toString() !== founderAgentId) {
                return ApiResponseBuilder.error(res, 403, {
                    message: 'Impossible de désactiver un compte FOUNDER',
                    error: 'founder_deactivation_forbidden'
                });
            }
        }

        // Log de sécurité
        console.log('⚠️ Agent deactivation initiated:', {
            targetAgentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            reason: reason || 'No reason provided',
            deactivatedBy: (req as any).user?.agentId,
            timestamp: formatForUser()
        });

        // Désactiver l'agent
        const updatedAgent = await Agent.findByIdAndUpdate(
            agent._id,
            {
                $set: {
                    isActive: false,
                    deactivatedAt: new Date(),
                    deactivationReason: reason || undefined,
                    deactivatedBy: (req as any).user?.agentId,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedAgent) {
            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la désactivation',
                error: 'deactivation_failed'
            });
        }

        console.log('✅ Agent deactivated successfully:', {
            agentId: updatedAgent._id?.toString(),
            agentName: updatedAgent.protocol?.agentName,
            timestamp: formatForUser()
        });

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agentId} désactivé avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    agentName: updatedAgent.protocol?.agentName,
                    isActive: updatedAgent.isActive,
                    deactivatedAt: updatedAgent.deactivatedAt,
                    deactivationReason: updatedAgent.deactivationReason
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error deactivating agent:', {
            agentId: req.params.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne',
            error: 'internal_server_error'
        });
    }
};

/**
 * PATCH /api/founder/agents/:agentId/reactivate
 * Réactive un agent désactivé - FOUNDER uniquement
 */
export const FounderReactivateAgent = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;

        // Validation de l'agentId
        const validation = validateIdentifier(agentId);
        if (!validation.isValid) {
            return ApiResponseBuilder.error(res, 400, {
                message: validation.error || 'ID d\'agent invalide',
                error: 'validation_error'
            });
        }

        // Trouver l'agent (même désactivé)
        const agent = await Agent.findOne({
            $or: [
                { _id: /^[0-9a-fA-F]{24}$/.test(agentId) ? agentId : null },
                { bungieId: agentId },
                { 'bungieUser.uniqueName': { $regex: new RegExp(`^${agentId}$`, 'i') } }
            ]
        });

        if (!agent) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Agent non trouvé',
                error: 'not_found'
            });
        }

        // Vérifier si déjà actif
        if (agent.isActive !== false) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Cet agent est déjà actif',
                error: 'already_active'
            });
        }

        // Log de sécurité
        console.log('🔄 Agent reactivation initiated:', {
            targetAgentId: agent._id?.toString(),
            bungieId: agent.bungieId,
            agentName: agent.protocol?.agentName,
            wasDeactivatedAt: agent.deactivatedAt,
            reactivatedBy: (req as any).user?.agentId,
            timestamp: formatForUser()
        });

        // Réactiver l'agent
        const updatedAgent = await Agent.findByIdAndUpdate(
            agent._id,
            {
                $set: {
                    isActive: true,
                    reactivatedAt: new Date(),
                    reactivatedBy: (req as any).user?.agentId,
                    updatedAt: new Date()
                },
                $unset: {
                    deactivatedAt: '',
                    deactivationReason: '',
                    deactivatedBy: ''
                }
            },
            { new: true }
        );

        if (!updatedAgent) {
            return ApiResponseBuilder.error(res, 500, {
                message: 'Échec de la réactivation',
                error: 'reactivation_failed'
            });
        }

        console.log('✅ Agent reactivated successfully:', {
            agentId: updatedAgent._id?.toString(),
            agentName: updatedAgent.protocol?.agentName,
            timestamp: formatForUser()
        });

        return res.status(200).json({
            success: true,
            message: `Agent ${updatedAgent.protocol?.agentName || agentId} réactivé avec succès`,
            data: {
                agent: {
                    _id: updatedAgent._id,
                    bungieId: updatedAgent.bungieId,
                    agentName: updatedAgent.protocol?.agentName,
                    isActive: updatedAgent.isActive,
                    reactivatedAt: updatedAgent.reactivatedAt
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error reactivating agent:', {
            agentId: req.params.agentId,
            error: error.message,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne',
            error: 'internal_server_error'
        });
    }
};


export const GetDeactivatedAgents = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        const [agents, total] = await Promise.all([
            Agent.find({ isActive: false })
                .select('bungieId bungieUser.uniqueName bungieUser.displayName protocol.agentName protocol.role protocol.clearanceLevel deactivatedAt deactivationReason deactivatedBy')
                .sort({ deactivatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Agent.countDocuments({ isActive: false })
        ]);

        console.log('Deactivated agents retrieved:', {
            total,
            page: pageNum,
            limit: limitNum,
            requestedBy: (req as any).user?.agentId,
            timestamp: formatForUser()
        });

        return res.status(200).json({
            success: true,
            data: {
                agents,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });

    } catch (error: any) {
        console.error('Error retrieving deactivated agents:', {
            error: error.message,
            timestamp: formatForUser()
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};