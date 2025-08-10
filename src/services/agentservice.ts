import { BungieTokenResponse } from '../types/bungie';
import { IAgent, IAgentDocument } from '../types/agent';
import { AgentModel } from '../models/agent.model';
class AgentService {
    async createOrUpdateAgent(
        agent: IAgent,
        tokens: BungieTokenResponse
    ): Promise<IAgentDocument> {
        try {
            console.log('🔍 Agent Profile received:');
            console.log('   bungieId:', agent.bungieId);
            console.log('   agentName:', agent.protocol.agentName);

            if (!agent.bungieId) {
                console.error('❌ ERREUR: bungieId manquant dans le profil Agent');
                throw new Error('Le bungieId est manquant dans le profil Agent. Impossible de créer ou mettre à jour l\'agent.');
            }

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            const existingPlayer = await AgentModel.findOne({
                bungieId: agent.bungieId
            });

            if (existingPlayer) {
                console.log(`🔄 Updating existing player with ID: ${existingPlayer._id}`);

                existingPlayer.protocol.agentName = agent.protocol.agentName;
                existingPlayer.destinyMemberships = agent.destinyMemberships;
                existingPlayer.bungieUser = agent.bungieUser;
                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };
                existingPlayer.lastActivity = now;
                existingPlayer.updatedAt = now;

                await existingPlayer.save();

                console.log(`✅ Updated existing agent: ${existingPlayer.protocol.agentName || 'UNDEFINED_NAME'}`);
                return existingPlayer as IAgentDocument;
            } else {
                const newAgent = new AgentModel({
                    bungieId: agent.bungieId,
                    destinyMemberships: agent.destinyMemberships,
                    bungieUser: agent.bungieUser,
                    bungieTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiresAt: expiresAt
                    },
                    protocol: {
                        agentName: agent.protocol.agentName,
                        customName: "",
                        species: agent.protocol.species || 'HUMAN',
                        role: agent.protocol.role || 'AGENT',
                        clearanceLevel: agent.protocol.clearanceLevel || 1,
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
                    console.log(`🎉 Created new agent: ${newAgent.protocol.agentName} (ID: ${newAgent._id})`);
                    return newAgent as IAgentDocument;
                } catch (saveError: any) {
                    console.error('❌ Erreur lors de la sauvegarde du nouvel agent:', saveError);
                    if (saveError.name === 'ValidationError') {
                        const validationErrors = Object.keys(saveError.errors).map(field => {
                            return `${field}: ${saveError.errors[field].message}`;
                        }).join(', ');
                        throw new Error(`Validation error: ${validationErrors}`);
                    }
                    throw saveError;
                }
            }
        } catch (error) {
            console.error('❌ Error creating/updating agent:', error);
            throw new Error(`Failed to create/update agent: ${error}`);
        }
    }

    async getAgentById(agentId: string): Promise<IAgentDocument | null> {
        try {
            const agent = await AgentModel.findById(agentId);

            if (agent) {
                console.log(`🔍 Found agent: ${agent.protocol.agentName} (ID: ${agentId})`);
            } else {
                console.log(`❌ Agent not found with ID: ${agentId}`);
            }

            return agent as IAgentDocument;
        } catch (error) {
            console.error('❌ Error getting agent by ID:', error);
            return null;
        }
    }

    async getAgentByBungieId(bungieId: string): Promise<IAgentDocument | null> {
        try {
            return await AgentModel.findOne({ bungieId }) as IAgentDocument;
        } catch (error) {
            console.error('❌ Error getting agent by Bungie ID:', error);
            return null;
        }
    }

    async getAgentByDestinyMembership(membershipType: number, membershipId: string): Promise<IAgentDocument | null> {
        try {
            const agent = await AgentModel.findOne({
                'destinyMemberships': {
                    $elemMatch: {
                        membershipType: membershipType,
                        membershipId: membershipId
                    }
                }
            });

            if (agent) {
                console.log(`🔍 Found agent by Destiny membership: ${agent.protocol.agentName}`);
            } else {
                console.log(`❓ No agent found with membershipType ${membershipType} and membershipId ${membershipId}`);
            }

            return agent as IAgentDocument;
        } catch (error) {
            console.error('❌ Error getting agent by Destiny membership:', error);
            return null;
        }
    }

    async updateLastActivity(agentId: string): Promise<void> {
        try {
            const now = new Date();
            await AgentModel.findByIdAndUpdate(agentId, {
                $set: { lastActivity: now, updatedAt: now }
            });
            console.log(`⏰ Updated last activity for agent: ${agentId}`);
        } catch (error) {
            console.error('❌ Error updating last activity:', error);
        }
    }

    async updateAgentProfile(agentId: string, updateData: Partial<IAgentDocument>): Promise<IAgentDocument | null> {
        try {
            const currentAgent = await this.getAgentById(agentId);
            if (!currentAgent) {
                console.error(`❌ Agent not found with ID: ${agentId}`);
                return null;
            }

            const sanitizedUpdateData = { ...updateData };
            delete sanitizedUpdateData._id;
            delete sanitizedUpdateData.bungieId;
            delete sanitizedUpdateData.bungieTokens;
            delete sanitizedUpdateData.joinedAt;
            delete sanitizedUpdateData.createdAt;

            const now = new Date();
            sanitizedUpdateData.updatedAt = now;

            if (sanitizedUpdateData.protocol && currentAgent.protocol) {
                sanitizedUpdateData.protocol = {
                    ...currentAgent.protocol,
                    ...sanitizedUpdateData.protocol,
                    settings: {
                        ...currentAgent.protocol.settings,
                        ...sanitizedUpdateData.protocol.settings
                    }
                };
            }

            const result = await AgentModel.findByIdAndUpdate(
                agentId,
                { $set: sanitizedUpdateData },
                { new: true }
            );

            if (result) {
                console.log(`✅ Successfully updated profile for: ${result.protocol.agentName}`);
                return result as IAgentDocument;
            } else {
                console.error(`❌ Agent not found with ID: ${agentId}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating agent profile:', error);
            throw new Error(`Failed to update agent profile: ${error}`);
        }
    }

    async getActiveAgentsCount(): Promise<number> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const count = await AgentModel.countDocuments({
                lastActivity: { $gte: thirtyDaysAgo }
            });

            console.log(`📊 Active agents count (last 30 days): ${count}`);
            return count;
        } catch (error) {
            console.error('❌ Error counting active agents:', error);
            return 0;
        }
    }
}

export const agentService = new AgentService();