import { BungieTokenResponse } from '../types/bungie';
import { bungieService } from './bungie.service';
import { IAgent, IAgentDocument } from '../types/agent';
import { Agent } from '../models/agent.model';
import { ValidationResult, AgentServiceStats } from '../types/services';
import { formatForUser, logger } from '../utils';

const TOKEN_EXPIRY_BUFFER_SECONDS = 300;
const MAX_AGENT_NAME_LENGTH = 50;
const MAX_CUSTOM_NAME_LENGTH = 50;
const MIN_CLEARANCE_LEVEL = 0;
const MAX_CLEARANCE_LEVEL = 10;
const ACTIVE_AGENT_THRESHOLD_DAYS = 30;
const DEFAULT_STATS = {
    completedTimelines: 0,
    fragmentsCollected: 0,
    lastFragmentUnlockedAt: undefined,
    lastSyncAt: new Date()
};
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
    async createOrUpdateAgent(agent: IAgent, tokens: BungieTokenResponse): Promise<IAgentDocument> {
        try {
            if (!agent || typeof agent !== 'object') {
                throw new Error('Profil d\'agent invalide');
            }

            if (!agent.bungieId || typeof agent.bungieId !== 'string' || agent.bungieId.trim().length === 0) {
                logger.error('Attempt to create agent without valid bungieId:', {
                    hasAgent: !!agent,
                    hasBungieId: !!agent?.bungieId,
                    bungieIdType: typeof agent?.bungieId,
                });
                throw new Error('The bungieId is missing or invalid in the Agent profile.');
            }

            if (!tokens || typeof tokens !== 'object') {
                throw new Error('Invalid Bungie tokens');
            }

            if (!tokens.access_token || !tokens.refresh_token || !tokens.expires_in) {
                throw new Error('Incomplete Bungie tokens');
            }

            if (typeof tokens.expires_in !== 'number' || tokens.expires_in <= 0) {
                throw new Error('Invalid token expiry duration');
            }

            if (!agent.protocol || !agent.protocol.agentName) {
                throw new Error('Missing agent protocol or agent name');
            }

            if (agent.protocol.agentName.length > MAX_AGENT_NAME_LENGTH) {
                throw new Error(`Agent name too long (max ${MAX_AGENT_NAME_LENGTH} characters)`);
            }

            const now = new Date();
            const expiresAt = new Date(now.getTime() + ((tokens.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000));

            const existingPlayer = await Agent.findOne({
                bungieId: agent.bungieId.trim()
            });

            if (existingPlayer) {
                logger.info('Updating an existing agent:', {
                    agentId: existingPlayer._id?.toString(),
                    bungieId: agent.bungieId,
                    agentName: agent.protocol.agentName
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

                    existingPlayer.set('destinyMemberships', mergedMemberships);
                }

                if (agent.bungieUser) {
                    const existingBungieUser = existingPlayer.bungieUser || {};
                    const isIncompleteProfile = !existingBungieUser.profilePicturePath ||
                        existingBungieUser.about === undefined ||
                        !existingBungieUser.locale;
                    logger.info('ProfilePicture Update Debug:', {
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
                        }
                    });

                    if (isIncompleteProfile) {
                        logger.info('🔄 Detected incomplete profile, performing full update:', {
                            agentId: existingPlayer._id?.toString()
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

                    logger.info('🖼️ ProfilePicture Final Values:', {
                        agentId: existingPlayer._id?.toString(),
                        finalProfilePicture: existingPlayer.bungieUser.profilePicture,
                        finalProfilePicturePath: existingPlayer.bungieUser.profilePicturePath
                    });
                }

                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };

                existingPlayer.lastActivity = now;
                existingPlayer.updatedAt = now;
                if (!existingPlayer.protocol?.stats) {
                    existingPlayer.set('protocol.stats', { ...DEFAULT_STATS });
                }
                try {
                    await existingPlayer.save();
                    return existingPlayer as unknown as IAgentDocument;
                } catch (saveError: any) {
                    logger.error('Error updating existing agent:', {
                        agentId: existingPlayer._id?.toString(),
                        error: saveError.message
                    });
                    throw new Error(`Failed to update agent: ${saveError.message}`);
                }
            } else {
                logger.info('Creating a new agent:', {
                    bungieId: agent.bungieId,
                    agentName: agent.protocol.agentName
                });

                const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                const species = allowedSpecies.includes(agent.protocol.species || '') ? agent.protocol.species : 'HUMAN';

                let roles: string[] = ['AGENT'];
                try {
                    const { getRoleAssignmentForBungieId } = await import('./role.service');
                    const preAssignment = await getRoleAssignmentForBungieId(agent.bungieId.trim());
                    if (preAssignment) {
                        roles = [preAssignment.roleId];
                        logger.info('Auto-assigned role detected:', {
                            bungieId: agent.bungieId,
                            roleId: preAssignment.roleId,
                            note: preAssignment.note
                        });
                    }
                } catch (roleError) {
                    logger.warn('Unable to check pre-assigned roles:', roleError);
                }

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
                        roles,
                        clearanceLevel,
                        hasSeenRecruitment: false,
                        protocolJoinedAt: now,
                        group: 'PROTOCOL',
                        settings: {
                            notifications: true,
                            publicProfile: true,
                            themes: { protocol: true, clovisBray: false, vanguard: false, blackArmory: false, opulence: false },
                            soundEffects: true
                        },
                        stats: { ...DEFAULT_STATS }
                    },
                    lastActivity: now,
                    createdAt: now,
                    updatedAt: now
                });

                try {
                    await newAgent.save();
                    logger.info('New agent created successfully:', {
                        agentId: newAgent._id?.toString(),
                        agentName: newAgent.protocol?.agentName || newAgent.bungieId
                    });
                    return newAgent as unknown as IAgentDocument;
                } catch (saveError: any) {
                    logger.error('Error saving new agent:', {
                        error: saveError.message,
                        bungieId: agent.bungieId,
                        agentName: agent.protocol.agentName
                    });

                    if (saveError.name === 'ValidationError') {
                        const validationErrors = Object.keys(saveError.errors).map(field => {
                            return `${field}: ${saveError.errors[field].message}`;
                        }).join(', ');
                        throw new Error(`Validation error while creating agent: ${validationErrors}`);
                    }

                    if (saveError.code === 11000) {
                        throw new Error('An agent with this bungieId already exists');
                    }

                    throw new Error(`Failed to create agent: ${saveError.message}`);
                }
            }
        } catch (error: any) {
            logger.error('Critical error during agent creation/update:', {
                error: error.message,
                stack: error.stack,
                bungieId: agent?.bungieId,
                agentName: agent?.protocol?.agentName,
            });

            if (error.message && error.message.includes('Échec') || error.message.includes('Erreur')) {
                throw error;
            }

            throw new Error(`Failed to create/update agent: ${error.message || 'Unknown error'}`);
        }
    }

    async getAgentById(agentId: string): Promise<IAgentDocument | null> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                logger.warn('Attempt to retrieve agent with invalid ID:', {
                    agentId,
                    type: typeof agentId
                });
                return null;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                logger.warn('Invalid agent ID format:', {
                    agentId: agentId.trim()
                });
                return null;
            }

            const agent = await Agent.findById(agentId.trim());

            if (agent) {
                logger.info('Agent retrieved successfully:', {
                    agentId,
                    agentName: agent.protocol?.agentName
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            logger.error('Error retrieving agent by ID:', {
                agentId,
                error: error.message
            });
            return null;
        }
    }

    async getAgentByBungieId(bungieId: string): Promise<IAgentDocument | null> {
        try {
            if (!bungieId || typeof bungieId !== 'string' || bungieId.trim().length === 0) {
                logger.warn('Attempt to retrieve agent with invalid Bungie ID:', {
                    bungieId,
                    type: typeof bungieId
                });
                return null;
            }

            const trimmedBungieId = bungieId.trim();
            if (trimmedBungieId.length > 50 || !/^\d+$/.test(trimmedBungieId)) {
                logger.warn('Invalid Bungie ID format:', {
                    bungieId: trimmedBungieId
                });
                return null;
            }

            const agent = await Agent.findOne({ bungieId: trimmedBungieId });

            if (agent) {
                logger.info('Agent found by Bungie ID:', {
                    bungieId: trimmedBungieId,
                    agentId: agent._id?.toString(),
                    agentName: agent.protocol?.agentName
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            logger.error('Error retrieving agent by Bungie ID:', {
                bungieId,
                error: error.message
            });
            return null;
        }
    }

    async getAgentByDestinyMembership(membershipType: number, membershipId: string): Promise<IAgentDocument | null> {
        try {
            if (typeof membershipType !== 'number' || membershipType < 0 || membershipType > 10) {
                logger.warn('Invalid Destiny membership type:', {
                    membershipType,
                    type: typeof membershipType
                });
                return null;
            }

            if (!membershipId || typeof membershipId !== 'string' || membershipId.trim().length === 0) {
                logger.warn('Invalid Destiny membership ID:', {
                    membershipId,
                    type: typeof membershipId
                });
                return null;
            }

            const trimmedMembershipId = membershipId.trim();
            if (trimmedMembershipId.length > 50 || !/^\d+$/.test(trimmedMembershipId)) {
                logger.warn('Invalid Destiny membership ID format:', {
                    membershipId: trimmedMembershipId
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
                logger.info('Agent found by Destiny membership:', {
                    membershipType,
                    membershipId: trimmedMembershipId,
                    agentId: agent._id?.toString(),
                    agentName: agent.protocol?.agentName
                });
            } else {
                logger.warn('No agent found for Destiny membership:', {
                    membershipType,
                    membershipId: trimmedMembershipId
                });
            }

            return agent as unknown as IAgentDocument;

        } catch (error: any) {
            logger.error('Error retrieving agent by Destiny membership:', {
                membershipType,
                membershipId,
                error: error.message
            });
            return null;
        }
    }

    async updateLastActivity(agentId: string): Promise<void> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                logger.warn('Invalid agent ID for last activity update:', {
                    agentId,
                    type: typeof agentId
                });
                return;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                logger.warn('Invalid agent ID format for last activity update:', {
                    agentId: agentId.trim()
                });
                return;
            }

            const now = new Date();
            const result = await Agent.findByIdAndUpdate(agentId.trim(), {
                $set: { lastActivity: now, updatedAt: now }
            });

            if (result) {
                logger.info('Last activity updated successfully:', {
                    agentId: agentId.trim()
                });
            } else {
                logger.warn('Agent not found for last activity update:', {
                    agentId: agentId.trim()
                });
            }

        } catch (error: any) {
            logger.error('Error updating last activity:', {
                agentId,
                error: error.message
            });
        }
    }

    async updateAgentProfile(agentId: string, updateData: Partial<IAgentDocument>): Promise<IAgentDocument | null> {
        try {
            if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
                logger.error('Invalid agent ID for profile update:', {
                    agentId,
                    type: typeof agentId
                });
                return null;
            }

            if (!updateData || typeof updateData !== 'object') {
                logger.error('Invalid update data for profile update:', {
                    agentId,
                    updateData
                });
                return null;
            }

            if (!/^[0-9a-fA-F]{24}$/.test(agentId.trim())) {
                logger.error('Invalid agent ID format:', {
                    agentId: agentId.trim()
                });
                return null;
            }

            const currentAgent = await this.getAgentById(agentId);
            if (!currentAgent) {
                logger.error('Agent not found for profile update:', {
                    agentId
                });
                return null;
            }

            const sanitizedUpdateData: any = {};
            const forbiddenFields = ['_id', 'bungieId', 'bungieTokens', 'joinedAt', 'createdAt'];

            for (const [key, value] of Object.entries(updateData)) {
                const baseField = key.split('.')[0];
                if (!forbiddenFields.includes(baseField)) {
                    sanitizedUpdateData[key] = value;
                }
            }

            const now = new Date();
            sanitizedUpdateData.updatedAt = now;
            logger.info('Updating agent profile:', {
                agentId,
                fields: Object.keys(sanitizedUpdateData),
                data: sanitizedUpdateData
            });

            const result = await Agent.findByIdAndUpdate(
                agentId.trim(),
                { $set: sanitizedUpdateData },
                { new: true, runValidators: true }
            );

            if (result) {
                logger.info('Agent profile updated successfully:', {
                    agentId,
                    agentName: result.protocol?.agentName,
                    updatedFields: Object.keys(sanitizedUpdateData)
                });
                return result as unknown as IAgentDocument;
            } else {
                logger.error('Agent not found during update:', {
                    agentId
                });
                return null;
            }

        } catch (error: any) {
            logger.error('Error updating agent profile:', {
                agentId,
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to update agent profile: ${error.message}`);
        }
    }
    async getActiveAgentsCount(): Promise<number> {
        try {
            const now = new Date();
            const thresholdDaysAgo = new Date();
            thresholdDaysAgo.setDate(thresholdDaysAgo.getDate() - ACTIVE_AGENT_THRESHOLD_DAYS);

            if (isNaN(thresholdDaysAgo.getTime()) || thresholdDaysAgo > now) {
                logger.error('Invalid active threshold date calculated:', {
                    thresholdDaysAgo,
                    now
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
                logger.warn('Invalid active agents count returned:', {
                    count,
                    type: typeof count
                });
                return 0;
            }

            logger.info('Calculated number of active agents:', {
                count,
                thresholdDays: ACTIVE_AGENT_THRESHOLD_DAYS,
                thresholdDate: thresholdDaysAgo.toISOString()
            });

            return count;

        } catch (error: any) {
            logger.error('Error counting active agents:', {
                error: error.message
            });
            return 0;
        }
    }

    validateAgentData(agentData: Partial<IAgent>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            if (!agentData.bungieId || typeof agentData.bungieId !== 'string') {
                errors.push('bungieId is required and must be a string');
            } else if (!/^\d+$/.test(agentData.bungieId.trim())) {
                errors.push('bungieId must contain only digits');
            }

            if (!agentData.protocol) {
                errors.push('protocol is required');
            } else {
                const protocol = agentData.protocol;

                if (!protocol.agentName || typeof protocol.agentName !== 'string') {
                    errors.push('agent name is required');
                } else if (protocol.agentName.length > MAX_AGENT_NAME_LENGTH) {
                    errors.push(`agent name too long (max ${MAX_AGENT_NAME_LENGTH} characters)`);
                }

                if (protocol.customName && protocol.customName.length > MAX_CUSTOM_NAME_LENGTH) {
                    errors.push(`custom name too long (max ${MAX_CUSTOM_NAME_LENGTH} characters)`);
                }

                if (protocol.species) {
                    const allowedSpecies = ['HUMAN', 'EXO', 'AWOKEN'];
                    if (!allowedSpecies.includes(protocol.species)) {
                        errors.push('invalid species (must be HUMAN, EXO or AWOKEN)');
                    }
                }

                if (protocol.roles) {
                    if (!Array.isArray(protocol.roles) || !protocol.roles.every(role => typeof role === 'string')) {
                        errors.push('roles must be an array of strings');
                    }
                }

                if (protocol.clearanceLevel !== undefined) {
                    if (typeof protocol.clearanceLevel !== 'number' ||
                        protocol.clearanceLevel < MIN_CLEARANCE_LEVEL ||
                        protocol.clearanceLevel > MAX_CLEARANCE_LEVEL) {
                        errors.push(`invalid clearance level (${MIN_CLEARANCE_LEVEL}-${MAX_CLEARANCE_LEVEL})`);
                    }
                }
            }

            if (agentData.destinyMemberships && Array.isArray(agentData.destinyMemberships)) {
                agentData.destinyMemberships.forEach((membership, index) => {
                    if (typeof membership.membershipType !== 'number' ||
                        membership.membershipType < 0 ||
                        membership.membershipType > 10) {
                        errors.push(`membership ${index}: invalid type`);
                    }
                    if (!membership.membershipId || typeof membership.membershipId !== 'string') {
                        errors.push(`membership ${index}: ID required`);
                    }
                });
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings: warnings.length > 0 ? warnings : undefined
            };

        } catch (error: any) {
            logger.error('Error while validating agent data:', {
                error: error.message
            });

            return {
                isValid: false,
                errors: ['Internal error during validation']
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
            logger.error('Error while checking if the agent exists:', {
                bungieId,
                error: error.message
            });
            return false;
        }
    }
    async getAgentStatistics(): Promise<AgentServiceStats> {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

            const [totalAgents, activeAgents, inactiveAgents, recentJoins] = await Promise.all([
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

            logger.info('Calculated agent statistics:', {
                stats
            });

            return stats;

        } catch (error: any) {
            logger.error('Error while calculating agent statistics:', {
                error: error.message
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
                logger.error('Agent not found for profile repair:', { agentId });
                return false;
            }

            if (!agent.bungieTokens?.accessToken) {
                logger.error('No valid Bungie tokens for profile repair:', { agentId });
                return false;
            }

            const freshProfile = await bungieService.getCurrentUser(agent.bungieTokens.accessToken);
            const updatedAgent = await this.createOrUpdateAgent(freshProfile, {
                access_token: agent.bungieTokens.accessToken,
                refresh_token: agent.bungieTokens.refreshToken,
                expires_in: Math.floor((agent.bungieTokens.expiresAt.getTime() - Date.now()) / 1000),
                token_type: 'Bearer',
                membership_id: agent.bungieId,
                refresh_expires_in: 86400
            });

            logger.info('Profile repair completed:', {
                agentId,
                hasProfilePicturePath: !!(updatedAgent.bungieUser?.profilePicturePath)
            });

            return true;
        } catch (error: any) {
            logger.error('Profile repair failed:', {
                agentId,
                error: error.message
            });
            return false;
        }
    }
}

export const agentService: IAgentService = new AgentService();

export { AgentService };