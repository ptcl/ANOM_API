import { AgentModel } from '../models/Agent';
import { BungieUserProfile, BungieTokenResponse } from '../types/bungie';
import { ObjectId } from 'mongoose';
import { IAgent } from '../types/agent';

interface IAgentDocument extends IAgent {
    bungieId: string;
    bungieTokens: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };
    joinedAt: Date;
}

class AgentService {
    async createOrUpdateAgent(
        bungieProfile: BungieUserProfile,
        tokens: BungieTokenResponse
    ): Promise<IAgentDocument> {
        try {
            // Log du profil reçu
            console.log('🔍 Bungie Profile received:');
            console.log('   membershipId:', bungieProfile.membershipId);
            console.log('   displayName:', bungieProfile.displayName);
            console.log('   membershipType:', bungieProfile.membershipType);

            if (!bungieProfile.membershipId) {
                console.error('❌ ERREUR: membershipId manquant dans le profil Bungie');
                throw new Error('Le membershipId est manquant dans le profil Bungie. Impossible de créer ou mettre à jour l\'agent.');
            }

            const now = new Date();
            const expiresAt = new Date(now.getTime() + (tokens.expires_in * 1000));

            // Cherche si le joueur existe déjà
            const existingPlayer = await AgentModel.findOne({
                bungieId: bungieProfile.membershipId
            });

            if (existingPlayer) {
                console.log(`🔄 Updating existing player with ID: ${existingPlayer._id}`);

                // Met à jour le joueur existant
                existingPlayer.protocol.agentName = `Agent ${bungieProfile.displayName || 'Unknown'}`;
                existingPlayer.lastActivity = now;
                existingPlayer.bungieTokens = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: expiresAt
                };
                existingPlayer.updatedAt = now;

                await existingPlayer.save();

                console.log(`✅ Updated existing agent: ${existingPlayer.protocol.agentName || 'UNDEFINED_NAME'}`);
                return existingPlayer as IAgentDocument;
            } else {
                // Crée un nouveau joueur
                const newAgent = new AgentModel({
                    bungieId: bungieProfile.membershipId,
                    bungieTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiresAt: expiresAt
                    },
                    protocol: {
                        agentName: `Agent ${bungieProfile.displayName || 'Unknown'}`,
                        customName: "",
                        species: 'HUMAN',
                        role: 'AGENT',
                        clearanceLevel: 1,
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

                console.log('🔍 Creating new agent with data:');
                console.log('   bungieId:', newAgent.bungieId);
                console.log('   agentName:', newAgent.protocol.agentName);

                try {
                    await newAgent.save();
                    console.log(`🎉 Created new agent: ${newAgent.protocol.agentName} (ID: ${newAgent._id})`);
                    return newAgent as IAgentDocument;
                } catch (saveError: any) {
                    console.error('❌ Erreur lors de la sauvegarde du nouvel agent:', saveError);
                    if (saveError.name === 'ValidationError') {
                        // Affiche les détails des erreurs de validation
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
            console.log(`🔄 Updating profile for agent: ${agentId}`);
            console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

            // Récupère l'agent actuel pour pouvoir fusionner correctement les objets imbriqués
            const currentAgent = await this.getAgentById(agentId);
            if (!currentAgent) {
                console.error(`❌ Agent not found with ID: ${agentId}`);
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
            if (sanitizedUpdateData.protocol && currentAgent.protocol) {
                sanitizedUpdateData.protocol = {
                    ...currentAgent.protocol,
                    ...sanitizedUpdateData.protocol,
                    // Assurer que les settings sont également fusionnés
                    settings: {
                        ...currentAgent.protocol.settings,
                        ...sanitizedUpdateData.protocol.settings
                    }
                };
            }

            const result = await AgentModel.findByIdAndUpdate(
                agentId,
                { $set: sanitizedUpdateData },
                { new: true } // Équivalent à returnDocument: 'after'
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
}

export const agentService = new AgentService();