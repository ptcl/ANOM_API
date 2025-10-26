import { Agent } from '../models/agent.model';
import { BungieTokenResponse } from '../types/bungie';
import { IAgent, IAgentDocument } from '../types/agent';

class PlayerService {
    async createOrUpdatePlayer(agent: IAgent, tokens: BungieTokenResponse): Promise<IAgentDocument> {
        try {

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            const existingPlayer = await Agent.findOne({
                bungieId: agent.bungieId
            });

            if (existingPlayer) {
                existingPlayer.lastActivity = now;
                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };
                existingPlayer.updatedAt = now;

                await existingPlayer.save();

                return existingPlayer as IAgentDocument;
            } else {
                const newPlayer = new Agent({
                    bungieId: agent.bungieId,
                    bungieTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiresAt: expiresAt
                    },
                    protocol: {
                        agentName: agent.protocol.agentName,
                        customName: "",
                        badges: [],
                        species: agent.protocol.species || 'HUMAN',
                        roles: Array.isArray(agent.protocol.roles) ? agent.protocol.roles : [agent.protocol.roles || 'AGENT'],
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


                await newPlayer.save();
                console.log('🔍 Creating new player with data:');
                return newPlayer as IAgentDocument;
            }
        } catch (error) {
            console.error('❌ Error creating/updating player:', error);
            throw new Error(`Failed to create/update player: ${error}`);
        }
    }

    async getPlayerById(playerId: string): Promise<IAgentDocument | null> {
        try {
            const player = await Agent.findById(playerId);

            if (player) {
                console.log(`🔍 Found player: ${player.protocol?.agentName} (ID: ${playerId})`);
            } else {
                console.log(`❌ Player not found with ID: ${playerId}`);
            }

            return player as IAgentDocument | null;
        } catch (error) {
            console.error('❌ Error getting player by ID:', error);
            return null;
        }
    }

    async getPlayerByBungieId(bungieId: string): Promise<IAgentDocument | null> {
        try {
            return await Agent.findOne({ bungieId }) as IAgentDocument;
        } catch (error) {
            console.error('❌ Error getting player by Bungie ID:', error);
            return null;
        }
    }

    async updateLastActivity(playerId: string): Promise<void> {
        try {
            const now = new Date();
            await Agent.findByIdAndUpdate(playerId, {
                $set: { lastActivity: now, updatedAt: now }
            });
            console.log(`⏰ Updated last activity for player: ${playerId}`);
        } catch (error) {
            console.error('❌ Error updating last activity:', error);
        }
    }

    async updatePlayerProfile(playerId: string, updateData: Partial<IAgentDocument>): Promise<IAgentDocument | null> {
        try {
            console.log(`🔄 Updating profile for player: ${playerId}`);

            const currentPlayer = await this.getPlayerById(playerId);
            if (!currentPlayer) {
                console.error(`❌ Player not found with ID: ${playerId}`);
                return null;
            }

            const sanitizedUpdateData = { ...updateData };
            delete sanitizedUpdateData._id;
            delete sanitizedUpdateData.bungieId;
            delete sanitizedUpdateData.bungieTokens;
            delete sanitizedUpdateData.createdAt;

            const now = new Date();
            sanitizedUpdateData.updatedAt = now;

            if (sanitizedUpdateData.protocol && currentPlayer.protocol) {
                sanitizedUpdateData.protocol = {
                    ...currentPlayer.protocol,
                    ...sanitizedUpdateData.protocol,
                    settings: {
                        ...currentPlayer.protocol.settings,
                        ...sanitizedUpdateData.protocol.settings
                    }
                };
            }

            const result = await Agent.findByIdAndUpdate(
                playerId,
                { $set: sanitizedUpdateData },
                { new: true }
            );

            if (result) {
                console.log(`✅ Successfully updated profile for: ${result.protocol?.agentName}`);
                return result as IAgentDocument ;
            } else {
                console.error(`❌ Player not found with ID: ${playerId}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating player profile:', error);
            throw new Error(`Failed to update player profile: ${error}`);
        }
    }
}

export const playerService = new PlayerService();