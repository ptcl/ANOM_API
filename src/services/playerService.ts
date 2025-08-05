import { AgentModel } from '../models/Agent';
import { BungieTokenResponse } from '../types/bungie';
import { IAgent } from '../types/agent';

interface IPlayerDocument extends IAgent {
    bungieId: string;
    joinedAt: Date;
}

class PlayerService {
    async createOrUpdatePlayer(
        agent: IAgent,
        tokens: BungieTokenResponse
    ): Promise<IPlayerDocument> {
        try {

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            const existingPlayer = await AgentModel.findOne({
                bungieId: agent.bungieId
            });

            if (existingPlayer) {

                existingPlayer.protocol.agentName = agent.protocol.agentName;
                existingPlayer.lastActivity = now;
                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };
                existingPlayer.updatedAt = now;

                await existingPlayer.save();

                return existingPlayer as IPlayerDocument;
            } else {
                const newPlayer = new AgentModel({
                    bungieId: agent.bungieId,
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

                console.log('🔍 Creating new player with data:');

                await newPlayer.save();
                return newPlayer as IPlayerDocument;
            }
        } catch (error) {
            console.error('❌ Error creating/updating player:', error);
            throw new Error(`Failed to create/update player: ${error}`);
        }
    }

    async getPlayerById(playerId: string): Promise<IPlayerDocument | null> {
        try {
            const player = await AgentModel.findById(playerId);

            if (player) {
                console.log(`🔍 Found player: ${player.protocol.agentName} (ID: ${playerId})`);
            } else {
                console.log(`❌ Player not found with ID: ${playerId}`);
            }

            return player as IPlayerDocument;
        } catch (error) {
            console.error('❌ Error getting player by ID:', error);
            return null;
        }
    }

    async getPlayerByBungieId(bungieId: string): Promise<IPlayerDocument | null> {
        try {
            return await AgentModel.findOne({ bungieId }) as IPlayerDocument;
        } catch (error) {
            console.error('❌ Error getting player by Bungie ID:', error);
            return null;
        }
    }

    async updateLastActivity(playerId: string): Promise<void> {
        try {
            const now = new Date();
            await AgentModel.findByIdAndUpdate(playerId, {
                $set: { lastActivity: now, updatedAt: now }
            });
            console.log(`⏰ Updated last activity for player: ${playerId}`);
        } catch (error) {
            console.error('❌ Error updating last activity:', error);
        }
    }

    async updatePlayerProfile(playerId: string, updateData: Partial<IPlayerDocument>): Promise<IPlayerDocument | null> {
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
            delete sanitizedUpdateData.joinedAt;
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

            const result = await AgentModel.findByIdAndUpdate(
                playerId,
                { $set: sanitizedUpdateData },
                { new: true }
            );

            if (result) {
                console.log(`✅ Successfully updated profile for: ${result.protocol.agentName}`);
                return result as IPlayerDocument;
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