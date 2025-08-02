import { getDB } from '../config/database';
import { Player } from '../models/Player';
import { BungieUserProfile, BungieTokenResponse } from '../types/bungie';
import { ObjectId } from 'mongodb';

class PlayerService {
    private db = getDB;

    async createOrUpdatePlayer(
        bungieProfile: BungieUserProfile,
        tokens: BungieTokenResponse
    ): Promise<Player> {
        try {
            const db = this.db();
            const playersCollection = db.collection<Player>('players');

            // 🆕 DEBUG: Log du profil reçu
            console.log('🔍 Bungie Profile received:');
            console.log('   membershipId:', bungieProfile.membershipId);
            console.log('   displayName:', bungieProfile.displayName);
            console.log('   membershipType:', bungieProfile.membershipType);
            console.log('   profilePicturePath:', bungieProfile.profilePicturePath);
            console.log('   Full profile keys:', Object.keys(bungieProfile));

            console.log(`👤 Creating/updating player: ${bungieProfile.displayName || 'UNDEFINED_NAME'}`);

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            // Cherche si le joueur existe déjà
            const existingPlayer = await playersCollection.findOne({
                bungieId: bungieProfile.membershipId
            });

            if (existingPlayer) {
                console.log(`🔄 Updating existing player with ID: ${existingPlayer._id}`);

                // Met à jour le joueur existant
                const updatedPlayer = await playersCollection.findOneAndUpdate(
                    { bungieId: bungieProfile.membershipId },
                    {
                        $set: {
                            displayName: bungieProfile.displayName || 'Unknown Player',
                            membershipType: bungieProfile.membershipType || 0,
                            profilePicturePath: bungieProfile.profilePicturePath,
                            lastActivity: now,
                            bungieTokens: {
                                accessToken: tokens.access_token,
                                refreshToken: tokens.refresh_token,
                                expiresAt: expiresAt
                            }
                        }
                    },
                    { returnDocument: 'after' }
                );

                console.log(`✅ Updated existing player: ${updatedPlayer?.displayName || 'UNDEFINED_NAME'}`);
                return updatedPlayer!;
            } else {
                // Crée un nouveau joueur
                const newPlayer: Player = {
                    bungieId: bungieProfile.membershipId,
                    displayName: bungieProfile.displayName || 'Unknown Player',
                    membershipType: bungieProfile.membershipType || 0,
                    profilePicturePath: bungieProfile.profilePicturePath,
                    role: 'agent',
                    bungieTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiresAt: expiresAt
                    },
                    protocol: {
                        agentName: `Agent ${bungieProfile.displayName || 'Unknown'}`,
                        species: 'HUMAN', // Valeur par défaut
                        clearanceLevel: 1,
                        hasSeenRecruitment: false
                    },
                    joinedAt: now,
                    lastActivity: now,
                    settings: {
                        notifications: true,
                        publicProfile: true,
                        protocolOSTheme: 'default',
                        protocolSounds: true
                    },
                };

                // 🆕 DEBUG: Log du joueur à créer
                console.log('🔍 Creating new player with data:');
                console.log('   bungieId:', newPlayer.bungieId);
                console.log('   displayName:', newPlayer.displayName);
                console.log('   membershipType:', newPlayer.membershipType);

                const result = await playersCollection.insertOne(newPlayer);
                newPlayer._id = result.insertedId;

                console.log(`🎉 Created new player: ${newPlayer.displayName} (ID: ${result.insertedId})`);

                // 🆕 Vérification en base
                const savedPlayer = await playersCollection.findOne({ _id: result.insertedId });
                console.log('🔍 Player saved in DB with displayName:', savedPlayer?.displayName);

                return newPlayer;
            }
        } catch (error) {
            console.error('❌ Error creating/updating player:', error);
            throw new Error(`Failed to create/update player: ${error}`);
        }
    }

    async getPlayerById(playerId: string): Promise<Player | null> {
        try {
            const db = this.db();
            const player = await db.collection<Player>('players').findOne({
                _id: new ObjectId(playerId)
            });

            if (player) {
                console.log(`🔍 Found player: ${player.displayName} (ID: ${playerId})`);
            } else {
                console.log(`❌ Player not found with ID: ${playerId}`);
            }

            return player;
        } catch (error) {
            console.error('❌ Error getting player by ID:', error);
            return null;
        }
    }

    async getPlayerByBungieId(bungieId: string): Promise<Player | null> {
        try {
            const db = this.db();
            return await db.collection<Player>('players').findOne({ bungieId });
        } catch (error) {
            console.error('❌ Error getting player by Bungie ID:', error);
            return null;
        }
    }

    async updateLastActivity(playerId: string): Promise<void> {
        try {
            const db = this.db();
            await db.collection<Player>('players').updateOne(
                { _id: new ObjectId(playerId) },
                { $set: { lastActivity: new Date() } }
            );
            console.log(`⏰ Updated last activity for player: ${playerId}`);
        } catch (error) {
            console.error('❌ Error updating last activity:', error);
        }
    }
}

export const playerService = new PlayerService();