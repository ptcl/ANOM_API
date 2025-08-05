import { AgentModel } from '../models/Agent';
import { BungieTokenResponse } from '../types/bungie';
import { ObjectId } from 'mongoose';
import { IAgent } from '../types/agent';

interface IAgentDocument extends IAgent {
    bungieId: string;
    bungieTokens: IAgent['bungieTokens'];
    joinedAt: Date;
}

class AgentService {
    async createOrUpdateAgent(
        agent: IAgent,
        tokens: BungieTokenResponse
    ): Promise<IAgentDocument> {
        try {
            // Log du profil reçu
            console.log('🔍 Agent Profile received:');
            console.log('   bungieId:', agent.bungieId);
            console.log('   agentName:', agent.protocol.agentName);

            if (!agent.bungieId) {
                console.error('❌ ERREUR: bungieId manquant dans le profil Agent');
                throw new Error('Le bungieId est manquant dans le profil Agent. Impossible de créer ou mettre à jour l\'agent.');
            }

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
                existingPlayer.destinyMemberships = agent.destinyMemberships; // Ajout des membres Destiny
                existingPlayer.bungieUser = agent.bungieUser; // Ajout de l'utilisateur Bungie
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
                // Crée un nouveau joueur
                const newAgent = new AgentModel({
                    bungieId: agent.bungieId,
                    destinyMemberships: agent.destinyMemberships, // Ajout des membres Destiny
                    bungieUser: agent.bungieUser, // Ajout de l'utilisateur Bungie
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