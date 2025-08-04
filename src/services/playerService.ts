import { AgentModel } from '../models/Agent';
import { BungieTokenResponse } from '../types/bungie';
import { ObjectId } from 'mongoose';
import { IAgent } from '../types/agent';

interface IPlayerDocument extends IAgent {
    bungieId: string;
    bungieTokens: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };
    joinedAt: Date;
}

class PlayerService {
    async createOrUpdatePlayer(
        agent: IAgent,
        tokens: BungieTokenResponse
    ): Promise<IPlayerDocument> {
        try {
            // Log du profil reçu
            console.log('🔍 Agent Profile received:');

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            // Cherche si le joueur existe déjà
            const existingPlayer = await AgentModel.findOne({
                bungieId: agent.bungieId
            });

            if (existingPlayer) {
                console.log(`🔄 Updating existing player with ID: ${existingPlayer._id}`);

                // Met à jour le joueur existant
                existingPlayer.protocol.agentName = agent.protocol.agentName;
                existingPlayer.lastActivity = now;
                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };
                existingPlayer.updatedAt = now;

                await existingPlayer.save();

                console.log(`✅ Updated existing player: ${existingPlayer.protocol.agentName || 'UNDEFINED_NAME'}`);
                return existingPlayer as IPlayerDocument;
            } else {
                // Crée un nouveau joueur
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

                // Log du joueur à créer
                console.log('🔍 Creating new player with data:');
                console.log('   bungieId:', newPlayer.bungieId);
                console.log('   agentName:', newPlayer.protocol.agentName);

                await newPlayer.save();

                console.log(`🎉 Created new player: ${newPlayer.displayName} (ID: ${newPlayer._id})`);

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
            console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

            // Récupère le joueur actuel pour pouvoir fusionner correctement les objets imbriqués
            const currentPlayer = await this.getPlayerById(playerId);
            if (!currentPlayer) {
                console.error(`❌ Player not found with ID: ${playerId}`);
                return null;
            }

            // Supprime les champs qui ne doivent pas être modifiables directement
            const sanitizedUpdateData = { ...updateData };
            delete sanitizedUpdateData._id;
            delete sanitizedUpdateData.bungieId;
            delete sanitizedUpdateData.bungieTokens;
            delete sanitizedUpdateData.joinedAt;
            delete sanitizedUpdateData.createdAt;

            // Mise à jour des dates d'activité
            const now = new Date();
            sanitizedUpdateData.updatedAt = now;

            // Traitement spécial pour les objets imbriqués (protocol)
            // Si protocol est présent dans la mise à jour, on le fusionne avec l'existant au lieu de le remplacer
            if (sanitizedUpdateData.protocol && currentPlayer.protocol) {
                sanitizedUpdateData.protocol = {
                    ...currentPlayer.protocol,
                    ...sanitizedUpdateData.protocol,
                    // Assurer que les settings sont également fusionnés
                    settings: {
                        ...currentPlayer.protocol.settings,
                        ...sanitizedUpdateData.protocol.settings
                    }
                };
            }

            const result = await AgentModel.findByIdAndUpdate(
                playerId,
                { $set: sanitizedUpdateData },
                { new: true } // Équivalent à returnDocument: 'after'
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