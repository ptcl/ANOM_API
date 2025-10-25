import { BungieTokenResponse } from '../types/bungie';
import { IAgent, IAgentDocument, IDestinyMembership } from '../types/agent';
import { Agent } from '../models/agent.model';
import { ValidationResult, AgentServiceStats } from '../types/services';
import { formatForUser } from '../utils';

const TOKEN_EXPIRY_BUFFER_SECONDS = 300; // 5 minutes de buffer
const MAX_AGENT_NAME_LENGTH = 50;
const MAX_CUSTOM_NAME_LENGTH = 50;
const MIN_CLEARANCE_LEVEL = 0;
const MAX_CLEARANCE_LEVEL = 10;
const ACTIVE_AGENT_THRESHOLD_DAYS = 30;

export interface IAgentService {
    createOrUpdateAgent(agent: IAgent, tokens: BungieTokenResponse): Promise<IAgentDocument>;
    getAgentById(agentId: string): Promise<IAgentDocument | null>;
    getAgentByBungieId(bungieId: string): Promise<IAgentDocument | null>;
    getAgentByDestinyMembership(membershipType: number, membershipId: string): Promise<IAgentDocument | null>;
    updateLastActivity(agentId: string): Promise<void>;
    updateAgentProfile(agentId: string, updateData: Partial<IAgentDocument>): Promise<IAgentDocument | null>;
    getActiveAgentsCount(): Promise<number>;
    validateAgentData(agentData: Partial<IAgent>): ValidationResult;
    agentExistsByBungieId(bungieId: string): Promise<boolean>;
    getAgentStatistics(): Promise<AgentServiceStats>;
    repairIncompleteProfile(agentId: string): Promise<boolean>;
}
class AgentService implements IAgentService {
    async createOrUpdateAgent(
        agent: IAgent,
        tokens: BungieTokenResponse
    ): Promise<IAgentDocument> {
        try {
            if (!agent || typeof agent !== 'object') {
                throw new Error('Profil d\'agent invalide');
            }

            if (!agent.bungieId || typeof agent.bungieId !== 'string' || agent.bungieId.trim().length === 0) {
                console.error('Tentative de création d\'agent sans bungieId valide:', {
                    hasAgent: !!agent,
                    hasBungieId: !!agent?.bungieId,
                    bungieIdType: typeof agent?.bungieId,
                    timestamp: formatForUser()
                });
                throw new Error('Le bungieId est manquant ou invalide dans le profil Agent');
            }

            if (!tokens || typeof tokens !== 'object') {
                throw new Error('Tokens Bungie invalides');
            }

            if (!tokens.access_token || !tokens.refresh_token || !tokens.expires_in) {
                throw new Error('Tokens Bungie incomplets');
            }

            if (typeof tokens.expires_in !== 'number' || tokens.expires_in <= 0) {
                throw new Error('Durée d\'expiration des tokens invalide');
            }

            if (!agent.protocol || !agent.protocol.agentName) {
                throw new Error('Protocole agent manquant ou nom d\'agent manquant');
            }

            if (agent.protocol.agentName.length > MAX_AGENT_NAME_LENGTH) {
                throw new Error(`Nom d'agent trop long (max ${MAX_AGENT_NAME_LENGTH} caractères)`);
            }

            const now = new Date();
            const expiresAt = new Date(now.getTime() + ((tokens.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000));

            const existingPlayer = await Agent.findOne({
                bungieId: agent.bungieId.trim()
            });

            if (existingPlayer) {
                console.log('Mise à jour d\'un agent existant:', {
                    agentId: existingPlayer._id?.toString(),
                    bungieId: agent.bungieId,
                    agentName: agent.protocol.agentName,
                    timestamp: formatForUser()
                });

                if (agent.destinyMemberships && Array.isArray(agent.destinyMemberships)) {
                    const existingMemberships = existingPlayer.destinyMemberships || [];
                    const newMemberships = agent.destinyMemberships.map(membership => ({
                        membershipType: membership.membershipType,
                        membershipId: membership.membershipId,
                        displayName: membership.displayName?.slice(0, 100) || '',
                        bungieGlobalDisplayName: membership.bungieGlobalDisplayName?.slice(0, 100) || ''
                    }));

                    const mergedMemberships: any[] = [...existingMemberships];

                    newMemberships.forEach(newMembership => {
                        const existingIndex = mergedMemberships.findIndex(
                            existing => existing.membershipType === newMembership.membershipType &&
                                existing.membershipId === newMembership.membershipId
                        );
                        if (existingIndex !== -1) {
                            mergedMemberships[existingIndex] = newMembership;
                        } else {
                            mergedMemberships.push(newMembership);
                        }
                    });

                    // ✅ Utiliser set() au lieu d'une assignation directe
                    existingPlayer.set('destinyMemberships', mergedMemberships);
                }

                if (agent.bungieUser) {
                    const existingBungieUser = existingPlayer.bungieUser || {};
                    const isIncompleteProfile = !existingBungieUser.profilePicturePath ||
                        existingBungieUser.about === undefined ||
                        !existingBungieUser.locale;
                    console.log('🖼️ ProfilePicture Update Debug:', {
                        agentId: existingPlayer._id?.toString(),
                        bungieId: agent.bungieId,
                        isIncompleteProfile,
                        newData: {
                            profilePicture: agent.bungieUser.profilePicture,
                            profilePictureType: typeof agent.bungieUser.profilePicture,
                            profilePicturePath: agent.bungieUser.profilePicturePath,
                            profilePicturePathType: typeof agent.bungieUser.profilePicturePath,
                        },
                        existingData: {
                            profilePicture: existingBungieUser.profilePicture,
                            profilePictureType: typeof existingBungieUser.profilePicture,
                            profilePicturePath: existingBungieUser.profilePicturePath,
                            profilePicturePathType: typeof existingBungieUser.profilePicturePath,
                        },
                        timestamp: formatForUser()
                    });

                    if (isIncompleteProfile) {
                        console.log('🔄 Detected incomplete profile, performing full update:', {
                            agentId: existingPlayer._id?.toString(),
                            timestamp: formatForUser()
                        });
                    }

                    if (isIncompleteProfile) {
                        existingPlayer.bungieUser = {
                            membershipId: agent.bungieUser.membershipId || existingBungieUser.membershipId,
                            uniqueName: agent.bungieUser.uniqueName?.slice(0, 100) || existingBungieUser.uniqueName || '',
                            displayName: agent.bungieUser.displayName?.slice(0, 100) || existingBungieUser.displayName || '',
                            profilePicture: typeof agent.bungieUser.profilePicture === 'number' ? agent.bungieUser.profilePicture : (existingBungieUser.profilePicture || 0),
                            about: agent.bungieUser.about || existingBungieUser.about || '',
                            firstAccess: agent.bungieUser.firstAccess || existingBungieUser.firstAccess,
                            lastAccess: agent.bungieUser.lastAccess || existingBungieUser.lastAccess,
                            psnDisplayName: agent.bungieUser.psnDisplayName || existingBungieUser.psnDisplayName || '',
                            showActivity: agent.bungieUser.showActivity !== undefined ? agent.bungieUser.showActivity : (existingBungieUser.showActivity || false),
                            locale: agent.bungieUser.locale || existingBungieUser.locale || '',
                            localeInheritDefault: agent.bungieUser.localeInheritDefault !== undefined ? agent.bungieUser.localeInheritDefault : (existingBungieUser.localeInheritDefault || false),
                            profilePicturePath: agent.bungieUser.profilePicturePath || existingBungieUser.profilePicturePath || '',
                            profileThemeName: agent.bungieUser.profileThemeName || existingBungieUser.profileThemeName || '',
                            steamDisplayName: agent.bungieUser.steamDisplayName || existingBungieUser.steamDisplayName || '',
                            twitchDisplayName: agent.bungieUser.twitchDisplayName || existingBungieUser.twitchDisplayName || '',
                            cachedBungieGlobalDisplayName: agent.bungieUser.cachedBungieGlobalDisplayName || existingBungieUser.cachedBungieGlobalDisplayName || '',
                            cachedBungieGlobalDisplayNameCode: agent.bungieUser.cachedBungieGlobalDisplayNameCode || existingBungieUser.cachedBungieGlobalDisplayNameCode || 0
                        };
                    } else {
                        // Profil complet existant : mise à jour sélective (préserver les données existantes si nouvelles données vides)
                        existingPlayer.bungieUser = {
                            membershipId: agent.bungieUser.membershipId || existingBungieUser.membershipId,
                            uniqueName: (agent.bungieUser.uniqueName?.trim() && agent.bungieUser.uniqueName.trim().length > 0)
                                ? agent.bungieUser.uniqueName.slice(0, 100)
                                : existingBungieUser.uniqueName || '',
                            displayName: (agent.bungieUser.displayName?.trim() && agent.bungieUser.displayName.trim().length > 0)
                                ? agent.bungieUser.displayName.slice(0, 100)
                                : existingBungieUser.displayName || '',
                            profilePicture: typeof agent.bungieUser.profilePicture === 'number'
                                ? agent.bungieUser.profilePicture
                                : (typeof existingBungieUser.profilePicture === 'number' ? existingBungieUser.profilePicture : 0),
                            // Préserver les autres champs existants
                            about: agent.bungieUser.about || existingBungieUser.about || '',
                            firstAccess: agent.bungieUser.firstAccess || existingBungieUser.firstAccess,
                            lastAccess: agent.bungieUser.lastAccess || existingBungieUser.lastAccess,
                            psnDisplayName: agent.bungieUser.psnDisplayName || existingBungieUser.psnDisplayName || '',
                            showActivity: agent.bungieUser.showActivity !== undefined ? agent.bungieUser.showActivity : existingBungieUser.showActivity || false,
                            locale: agent.bungieUser.locale || existingBungieUser.locale || '',
                            localeInheritDefault: agent.bungieUser.localeInheritDefault !== undefined ? agent.bungieUser.localeInheritDefault : existingBungieUser.localeInheritDefault || false,
                            profilePicturePath: (agent.bungieUser.profilePicturePath?.trim() && agent.bungieUser.profilePicturePath.trim().length > 0)
                                ? agent.bungieUser.profilePicturePath.trim()
                                : existingBungieUser.profilePicturePath || '',
                            profileThemeName: agent.bungieUser.profileThemeName || existingBungieUser.profileThemeName || '',
                            steamDisplayName: agent.bungieUser.steamDisplayName || existingBungieUser.steamDisplayName || '',
                            twitchDisplayName: agent.bungieUser.twitchDisplayName || existingBungieUser.twitchDisplayName || '',
                            cachedBungieGlobalDisplayName: agent.bungieUser.cachedBungieGlobalDisplayName || existingBungieUser.cachedBungieGlobalDisplayName || '',
                            cachedBungieGlobalDisplayNameCode: agent.bungieUser.cachedBungieGlobalDisplayNameCode || existingBungieUser.cachedBungieGlobalDisplayNameCode || 0
                        };
                    }

                    // Log après mise à jour
                    console.log('🖼️ ProfilePicture Final Values:', {
                        agentId: existingPlayer._id?.toString(),
                        finalProfilePicture: existingPlayer.bungieUser.profilePicture,
                        finalProfilePicturePath: existingPlayer.bungieUser.profilePicturePath,
                        timestamp: formatForUser()
                    });
                }

                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };

                existingPlayer.lastActivity = now;
                existingPlayer.updatedAt = now;

                try {
                    await existingPlayer.save();
                    return existingPlayer as unknown as IAgentDocument;
                } catch (saveError: any) {
                    console.error('Erreur lors de la mise à jour de l\'agent existant:', {
                        agentId: existingPlayer._id?.toString(),
                        error: saveError.message,
                        timestamp: formatForUser()
                    });
                    throw new Error(`Échec de la mise à jour de l'agent: ${saveError.message}`);
                }
            } else {
                console.log('Création d\'un nouvel agent:', {
                    bungieId: agent.bungieId,
                    agentName: agent.protocol.agentName,
                    timestamp: formatForUser()
                });

                const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                const species = allowedSpecies.includes(agent.protocol.species || '') ? agent.protocol.species : 'HUMAN';

                const allowedRoles = ['AGENT', 'SPECIALIST', 'FOUNDER'];
                const role = allowedRoles.includes(agent.protocol.role || '') ? agent.protocol.role : 'AGENT';

                let clearanceLevel = agent.protocol.clearanceLevel || 1;
                if (typeof clearanceLevel !== 'number' || clearanceLevel < MIN_CLEARANCE_LEVEL || clearanceLevel > MAX_CLEARANCE_LEVEL) {
                    clearanceLevel = 1;
                }

                const sanitizedMemberships = agent.destinyMemberships?.map(membership => ({
                    membershipType: membership.membershipType,
                    membershipId: membership.membershipId,
                    displayName: membership.displayName?.slice(0, 100) || '',
                    bungieGlobalDisplayName: membership.bungieGlobalDisplayName?.slice(0, 100) || ''
                })) || [];

                const sanitizedBungieUser = agent.bungieUser ? {
                    membershipId: agent.bungieUser.membershipId,
                    uniqueName: agent.bungieUser.uniqueName?.slice(0, 100) || '',
                    displayName: agent.bungieUser.displayName?.slice(0, 100) || '',
                    profilePicture: typeof agent.bungieUser.profilePicture === 'number' ? agent.bungieUser.profilePicture : 0,
                    about: agent.bungieUser.about || '',
                    firstAccess: agent.bungieUser.firstAccess,
                    lastAccess: agent.bungieUser.lastAccess,
                    psnDisplayName: agent.bungieUser.psnDisplayName || '',
                    showActivity: agent.bungieUser.showActivity || false,
                    locale: agent.bungieUser.locale || '',
                    localeInheritDefault: agent.bungieUser.localeInheritDefault || false,
                    profilePicturePath: agent.bungieUser.profilePicturePath || '',
                    profileThemeName: agent.bungieUser.profileThemeName || '',
                    steamDisplayName: agent.bungieUser.steamDisplayName || '',
                    twitchDisplayName: agent.bungieUser.twitchDisplayName || '',
                    cachedBungieGlobalDisplayName: agent.bungieUser.cachedBungieGlobalDisplayName || '',
                    cachedBungieGlobalDisplayNameCode: agent.bungieUser.cachedBungieGlobalDisplayNameCode || 0
                } : undefined;

                const newAgent = new Agent({
                    bungieId: agent.bungieId.trim(),
                    destinyMemberships: sanitizedMemberships,
                    bungieUser: sanitizedBungieUser,
                    bungieTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiresAt: expiresAt
                    },
                    protocol: {
                        agentName: agent.protocol.agentName.trim(),
                        customName: "",
                        species,
                        role,
                        clearanceLevel,
                        hasSeenRecruitment: false,
                        protocolJoinedAt: now,
                        group: 'PROTOCOL',
                        settings: {
                            notifications: true,
                            publicProfile: true,
                            protocolOSTheme: 'DEFAULT',
                            protocolSounds: true
                        }
                    },
                    lastActivity: now,
                    createdAt: now,
                    updatedAt: now
                });

                try {
                    await newAgent.save();
                    console.log('Nouvel agent créé avec succès:', {
                        agentId: newAgent._id?.toString(),
                        agentName: newAgent.protocol?.agentName || newAgent.bungieId,
                        timestamp: formatForUser()
                    });
                    return newAgent as unknown as IAgentDocument;
                } catch (saveError: any) {
                    console.error('Erreur lors de la sauvegarde du nouvel agent:', {
                        error: saveError.message,
                        bungieId: agent.bungieId,
                        agentName: agent.protocol.agentName,
                        timestamp: formatForUser()
                    });

                    if (saveError.name === 'ValidationError') {
                        const validationErrors = Object.keys(saveError.errors).map(field => {
                            return `${field}: ${saveError.errors[field].message}`;
                        }).join(', ');
                        throw new Error(`Erreur de validation lors de la création de l'agent: ${validationErrors}`);
                    }

                    if (saveError.code === 11000) {
                        throw new Error('Un agent avec ce bungieId existe déjà');
                    }

                    throw new Error(`Échec de la création de l'agent: ${saveError.message}`);
                }
            }
        } catch (error: any) {
            console.error('Erreur critique lors de la création/mise à jour de l\'agent:', {
                error: error.message,
                stack: error.stack,
                bungieId: agent?.bungieId,
                agentName: agent?.protocol?.agentName,
                timestamp: formatForUser()
            });

            if (error.message && error.message.includes('Échec') || error.message.includes('Erreur')) {
                throw error;
            }

            throw new Error(`Échec de la création/mise à jour de l'agent: ${error.message || 'Erreur inconnue'}`);
        }
    }

    async getAgentById(agentId: string): Promise<IAgentDocument | null> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                console.warn('Tentative de récupération d\'agent avec ID invalide:', {
                    agentId,
                    type: typeof agentId,
                    timestamp: formatForUser()
                });
                return null;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                console.warn('Format d\'ID agent invalide:', {
                    agentId: agentId.trim(),
                    timestamp: formatForUser()
                });
                return null;
            }

            const agent = await Agent.findById(agentId.trim());

            if (agent) {
                console.log('Agent récupéré avec succès:', {
                    agentId,
                    agentName: agent.protocol?.agentName,
                    timestamp: formatForUser()
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'agent par ID:', {
                agentId,
                error: error.message,
                timestamp: formatForUser()
            });
            return null;
        }
    }

    async getAgentByBungieId(bungieId: string): Promise<IAgentDocument | null> {
        try {
            if (!bungieId || typeof bungieId !== 'string' || bungieId.trim().length === 0) {
                console.warn('Tentative de récupération d\'agent avec Bungie ID invalide:', {
                    bungieId,
                    type: typeof bungieId,
                    timestamp: formatForUser()
                });
                return null;
            }

            const trimmedBungieId = bungieId.trim();
            if (trimmedBungieId.length > 50 || !/^\d+$/.test(trimmedBungieId)) {
                console.warn('Format de Bungie ID invalide:', {
                    bungieId: trimmedBungieId,
                    timestamp: formatForUser()
                });
                return null;
            }

            const agent = await Agent.findOne({ bungieId: trimmedBungieId });

            if (agent) {
                console.log('Agent trouvé par Bungie ID:', {
                    bungieId: trimmedBungieId,
                    agentId: agent._id?.toString(),
                    agentName: agent.protocol?.agentName,
                    timestamp: formatForUser()
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'agent par Bungie ID:', {
                bungieId,
                error: error.message,
                timestamp: formatForUser()
            });
            return null;
        }
    }

    async getAgentByDestinyMembership(membershipType: number, membershipId: string): Promise<IAgentDocument | null> {
        try {
            if (typeof membershipType !== 'number' || membershipType < 0 || membershipType > 10) {
                console.warn('Type de membership Destiny invalide:', {
                    membershipType,
                    type: typeof membershipType,
                    timestamp: formatForUser()
                });
                return null;
            }

            if (!membershipId || typeof membershipId !== 'string' || membershipId.trim().length === 0) {
                console.warn('ID de membership Destiny invalide:', {
                    membershipId,
                    type: typeof membershipId,
                    timestamp: formatForUser()
                });
                return null;
            }

            const trimmedMembershipId = membershipId.trim();
            if (trimmedMembershipId.length > 50 || !/^\d+$/.test(trimmedMembershipId)) {
                console.warn('Format d\'ID de membership Destiny invalide:', {
                    membershipId: trimmedMembershipId,
                    timestamp: formatForUser()
                });
                return null;
            }

            const agent = await Agent.findOne({
                'destinyMemberships': {
                    $elemMatch: {
                        membershipType: membershipType,
                        membershipId: trimmedMembershipId
                    }
                }
            });

            if (agent) {
                console.log('Agent trouvé par membership Destiny:', {
                    membershipType,
                    membershipId: trimmedMembershipId,
                    agentId: agent._id?.toString(),
                    agentName: agent.protocol?.agentName,
                    timestamp: formatForUser()
                });
            } else {
                console.log('Aucun agent trouvé pour le membership Destiny:', {
                    membershipType,
                    membershipId: trimmedMembershipId,
                    timestamp: formatForUser()
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'agent par membership Destiny:', {
                membershipType,
                membershipId,
                error: error.message,
                timestamp: formatForUser()
            });
            return null;
        }
    }

    async updateLastActivity(agentId: string): Promise<void> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                console.warn('Tentative de mise à jour d\'activité avec ID invalide:', {
                    agentId,
                    type: typeof agentId,
                    timestamp: formatForUser()
                });
                return;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                console.warn('Format d\'ID agent invalide pour mise à jour d\'activité:', {
                    agentId: agentId.trim(),
                    timestamp: formatForUser()
                });
                return;
            }

            const now = new Date();
            const result = await Agent.findByIdAndUpdate(agentId.trim(), {
                $set: { lastActivity: now, updatedAt: now }
            });

            if (result) {
                console.log('Activité mise à jour avec succès:', {
                    agentId: agentId.trim(),
                    timestamp: formatForUser()
                });
            } else {
                console.warn('Agent non trouvé pour mise à jour d\'activité:', {
                    agentId: agentId.trim(),
                    timestamp: formatForUser()
                });
            }

        } catch (error: any) {
            console.error('Erreur lors de la mise à jour de la dernière activité:', {
                agentId,
                error: error.message,
                timestamp: formatForUser()
            });
        }
    }

    async updateAgentProfile(agentId: string, updateData: Partial<IAgentDocument>): Promise<IAgentDocument | null> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                console.error('ID d\'agent invalide pour mise à jour de profil:', {
                    agentId,
                    type: typeof agentId,
                    timestamp: formatForUser()
                });
                return null;
            }

            if (!updateData || typeof updateData !== 'object') {
                console.error('Données de mise à jour invalides:', {
                    agentId,
                    updateData,
                    timestamp: formatForUser()
                });
                return null;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                console.error('Format d\'ID agent invalide:', {
                    agentId: agentId.trim(),
                    timestamp: formatForUser()
                });
                return null;
            }

            const currentAgent = await this.getAgentById(agentId);
            if (!currentAgent) {
                console.error('Agent non trouvé pour mise à jour de profil:', {
                    agentId,
                    timestamp: formatForUser()
                });
                return null;
            }

            const sanitizedUpdateData: any = {};
            const forbiddenFields = ['_id', 'bungieId', 'bungieTokens', 'joinedAt', 'createdAt'];

            // ✅ Ne pas filtrer les champs ici, on les reçoit déjà aplatis depuis le contrôleur
            for (const [key, value] of Object.entries(updateData)) {
                // Vérifier si c'est un champ interdit (sans le préfixe "protocol.")
                const baseField = key.split('.')[0];
                if (!forbiddenFields.includes(baseField)) {
                    sanitizedUpdateData[key] = value;
                }
            }

            const now = new Date();
            sanitizedUpdateData.updatedAt = now;
            console.log('Mise à jour de profil d\'agent:', {
                agentId,
                fields: Object.keys(sanitizedUpdateData),
                data: sanitizedUpdateData,
                timestamp: formatForUser()
            });

            const result = await Agent.findByIdAndUpdate(
                agentId.trim(),
                { $set: sanitizedUpdateData },
                { new: true, runValidators: true }
            );

            if (result) {
                console.log('Profil d\'agent mis à jour avec succès:', {
                    agentId,
                    agentName: result.protocol?.agentName,
                    updatedFields: Object.keys(sanitizedUpdateData),
                    timestamp: formatForUser()
                });
                return result as unknown as IAgentDocument;
            } else {
                console.error('Agent non trouvé lors de la mise à jour:', {
                    agentId,
                    timestamp: formatForUser()
                });
                return null;
            }

        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du profil d\'agent:', {
                agentId,
                error: error.message,
                stack: error.stack,
                timestamp: formatForUser()
            });
            throw new Error(`Échec de la mise à jour du profil d'agent: ${error.message}`);
        }
    }
    async getActiveAgentsCount(): Promise<number> {
        try {
            const now = new Date();
            const thresholdDaysAgo = new Date();
            thresholdDaysAgo.setDate(thresholdDaysAgo.getDate() - ACTIVE_AGENT_THRESHOLD_DAYS);

            if (isNaN(thresholdDaysAgo.getTime()) || thresholdDaysAgo > now) {
                console.error('Date de seuil d\'activité invalide calculée:', {
                    thresholdDaysAgo,
                    now,
                    timestamp: formatForUser()
                });
                return 0;
            }

            const count = await Agent.countDocuments({
                lastActivity: {
                    $gte: thresholdDaysAgo,
                    $lte: now
                }
            });

            if (typeof count !== 'number' || count < 0) {
                console.warn('Nombre d\'agents actifs invalide retourné:', {
                    count,
                    type: typeof count,
                    timestamp: formatForUser()
                });
                return 0;
            }

            console.log('Nombre d\'agents actifs calculé:', {
                count,
                thresholdDays: ACTIVE_AGENT_THRESHOLD_DAYS,
                thresholdDate: thresholdDaysAgo.toISOString(),
                timestamp: formatForUser()
            });

            return count;

        } catch (error: any) {
            console.error('Erreur lors du comptage des agents actifs:', {
                error: error.message,
                timestamp: formatForUser()
            });
            return 0;
        }
    }

    validateAgentData(agentData: Partial<IAgent>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            if (!agentData.bungieId || typeof agentData.bungieId !== 'string') {
                errors.push('bungieId est requis et doit être une chaîne');
            } else if (!/^\d+$/.test(agentData.bungieId.trim())) {
                errors.push('bungieId doit contenir uniquement des chiffres');
            }

            if (!agentData.protocol) {
                errors.push('protocole est requis');
            } else {
                const protocol = agentData.protocol;

                if (!protocol.agentName || typeof protocol.agentName !== 'string') {
                    errors.push('nom d\'agent est requis');
                } else if (protocol.agentName.length > MAX_AGENT_NAME_LENGTH) {
                    errors.push(`nom d'agent trop long (max ${MAX_AGENT_NAME_LENGTH} caractères)`);
                }

                if (protocol.customName && protocol.customName.length > MAX_CUSTOM_NAME_LENGTH) {
                    errors.push(`nom personnalisé trop long (max ${MAX_CUSTOM_NAME_LENGTH} caractères)`);
                }

                if (protocol.species) {
                    const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                    if (!allowedSpecies.includes(protocol.species)) {
                        errors.push('espèce invalide (doit être HUMAN, EXO ou AWOKEN)');
                    }
                }

                if (protocol.role) {
                    const allowedRoles = ['AGENT', 'SPECIALIST', 'FOUNDER'];
                    if (!allowedRoles.includes(protocol.role)) {
                        errors.push('rôle invalide (doit être AGENT, SPECIALIST ou FOUNDER)');
                    }
                }

                if (protocol.clearanceLevel !== undefined) {
                    if (typeof protocol.clearanceLevel !== 'number' ||
                        protocol.clearanceLevel < MIN_CLEARANCE_LEVEL ||
                        protocol.clearanceLevel > MAX_CLEARANCE_LEVEL) {
                        errors.push(`niveau d'autorisation invalide (${MIN_CLEARANCE_LEVEL}-${MAX_CLEARANCE_LEVEL})`);
                    }
                }
            }

            if (agentData.destinyMemberships && Array.isArray(agentData.destinyMemberships)) {
                agentData.destinyMemberships.forEach((membership, index) => {
                    if (typeof membership.membershipType !== 'number' ||
                        membership.membershipType < 0 ||
                        membership.membershipType > 10) {
                        errors.push(`membership ${index}: type invalide`);
                    }
                    if (!membership.membershipId || typeof membership.membershipId !== 'string') {
                        errors.push(`membership ${index}: ID requis`);
                    }
                });
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings: warnings.length > 0 ? warnings : undefined
            };

        } catch (error: any) {
            console.error('Erreur lors de la validation des données agent:', {
                error: error.message,
                timestamp: formatForUser()
            });

            return {
                isValid: false,
                errors: ['Erreur interne lors de la validation']
            };
        }
    }

    async agentExistsByBungieId(bungieId: string): Promise<boolean> {
        try {
            if (!bungieId || typeof bungieId !== 'string' || bungieId.trim().length === 0) {
                return false;
            }

            const trimmedBungieId = bungieId.trim();
            if (!/^\d+$/.test(trimmedBungieId)) {
                return false;
            }

            const count = await Agent.countDocuments({
                bungieId: trimmedBungieId
            });

            return count > 0;

        } catch (error: any) {
            console.error('Erreur lors de la vérification d\'existence de l\'agent:', {
                bungieId,
                error: error.message,
                timestamp: formatForUser()
            });
            return false;
        }
    }
    async getAgentStatistics(): Promise<AgentServiceStats> {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

            const [
                totalAgents,
                activeAgents,
                inactiveAgents,
                recentJoins
            ] = await Promise.all([
                Agent.countDocuments({}),
                Agent.countDocuments({
                    isActive: true
                }),
                Agent.countDocuments({
                    isActive: false
                }),
                Agent.countDocuments({
                    joinedAt: { $gte: thirtyDaysAgo }
                })
            ]);

            const stats: AgentServiceStats = {
                totalAgents,
                activeAgents,
                inactiveAgents,
                recentJoins
            };

            console.log('Statistiques des agents calculées:', {
                stats,
                timestamp: formatForUser()
            });

            return stats;

        } catch (error: any) {
            console.error('Erreur lors du calcul des statistiques d\'agents:', {
                error: error.message,
                timestamp: formatForUser()
            });

            return {
                totalAgents: 0,
                activeAgents: 0,
                inactiveAgents: 0,
                recentJoins: 0
            };
        }
    }

    async repairIncompleteProfile(agentId: string): Promise<boolean> {
        try {
            const agent = await this.getAgentById(agentId);
            if (!agent) {
                console.error('Agent not found for profile repair:', { agentId });
                return false;
            }

            if (!agent.bungieTokens?.accessToken) {
                console.error('No valid Bungie tokens for profile repair:', { agentId });
                return false;
            }

            const { bungieService } = await import('./bungieservice');
            const freshProfile = await bungieService.getCurrentUser(agent.bungieTokens.accessToken);
            const updatedAgent = await this.createOrUpdateAgent(freshProfile, {
                access_token: agent.bungieTokens.accessToken,
                refresh_token: agent.bungieTokens.refreshToken,
                expires_in: Math.floor((agent.bungieTokens.expiresAt.getTime() - Date.now()) / 1000),
                token_type: 'Bearer',
                membership_id: agent.bungieId,
                refresh_expires_in: 86400
            });

            console.log('Profile repair completed:', {
                agentId,
                hasProfilePicturePath: !!(updatedAgent.bungieUser?.profilePicturePath),
                timestamp: formatForUser()
            });

            return true;
        } catch (error: any) {
            console.error('Profile repair failed:', {
                agentId,
                error: error.message,
                timestamp: formatForUser()
            });
            return false;
        }
    }
}

export const agentService: IAgentService = new AgentService();

export { AgentService };