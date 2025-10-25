import { Agent } from '../models/agent.model';
import { IAgentDocument } from '../types/agent';

/**
 * Helper pour identifier et récupérer un agent par différents types d'identifiants
 */

export interface AgentIdentifier {
    type: 'mongodb_id' | 'bungie_id' | 'unique_name' | 'unknown';
    value: string;
}

/**
 * Détecte le type d'identifiant fourni
 */
export function detectIdentifierType(identifier: string): AgentIdentifier {
    const trimmed = identifier.trim();

    // MongoDB ObjectId (24 caractères hexadécimaux)
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
        return { type: 'mongodb_id', value: trimmed };
    }

    // Bungie ID (nombre uniquement)
    if (/^\d+$/.test(trimmed)) {
        return { type: 'bungie_id', value: trimmed };
    }

    // Unique Name (tout le reste, généralement format "Name#1234")
    if (trimmed.length > 0) {
        return { type: 'unique_name', value: trimmed };
    }

    return { type: 'unknown', value: trimmed };
}

/**
 * Échappe les caractères spéciaux pour regex
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Trouve un agent par n'importe quel type d'identifiant
 * @param identifier - L'identifiant de l'agent (MongoDB ID, Bungie ID, ou uniqueName)
 * @returns L'agent trouvé ou null
 */
export async function findAgentByIdentifier(identifier: string): Promise<IAgentDocument | null> {
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
        return null;
    }

    const id = detectIdentifierType(identifier);

    try {
        let agent: IAgentDocument | null = null;

        switch (id.type) {
            case 'mongodb_id':
                console.log('🔍 Searching by MongoDB ID:', id.value);
                agent = await Agent.findById(id.value) as IAgentDocument;
                break;

            case 'bungie_id':
                console.log('🔍 Searching by Bungie ID:', id.value);
                agent = await Agent.findOne({ bungieId: id.value }) as IAgentDocument;
                break;

            case 'unique_name':
                console.log('🔍 Searching by uniqueName:', id.value);
                // Recherche insensible à la casse pour uniqueName
                agent = await Agent.findOne({
                    'bungieUser.uniqueName': {
                        $regex: new RegExp(`^${escapeRegex(id.value)}$`, 'i')
                    }
                }) as IAgentDocument;

                // Debug: si pas trouvé, chercher tous les agents pour voir les uniqueNames
                if (!agent) {
                    console.log('❌ Agent not found with uniqueName, checking all agents...');
                    const allAgents = await Agent.find({}, {
                        'bungieUser.uniqueName': 1,
                        'bungieUser.displayName': 1,
                        'protocol.agentName': 1
                    }).limit(10);
                    console.log('📋 Sample of existing uniqueNames:',
                        allAgents.map(a => ({
                            uniqueName: a.bungieUser?.uniqueName,
                            displayName: a.bungieUser?.displayName,
                            agentName: a.protocol?.agentName
                        }))
                    );
                }
                break;

            case 'unknown':
            default:
                console.warn('⚠️ Unknown identifier type:', id.value);
                return null;
        }

        if (agent) {
            console.log('✅ Agent found:', {
                _id: agent._id,
                bungieId: agent.bungieId,
                uniqueName: agent.bungieUser?.uniqueName,
                agentName: agent.protocol?.agentName
            });
        }

        return agent;

    } catch (error: any) {
        console.error('Error finding agent by identifier:', {
            identifier: id.value,
            type: id.type,
            error: error.message
        });
        return null;
    }
}

/**
 * Trouve plusieurs agents par leurs identifiants
 * @param identifiers - Tableau d'identifiants
 * @returns Tableau d'agents trouvés
 */
export async function findAgentsByIdentifiers(identifiers: string[]): Promise<IAgentDocument[]> {
    if (!Array.isArray(identifiers) || identifiers.length === 0) {
        return [];
    }

    const agents = await Promise.all(
        identifiers.map(id => findAgentByIdentifier(id))
    );

    // Filtrer les null et retourner uniquement les agents trouvés
    return agents.filter((agent): agent is IAgentDocument => agent !== null);
}

/**
 * Vérifie si un agent existe par n'importe quel identifiant
 * @param identifier - L'identifiant de l'agent
 * @returns true si l'agent existe, false sinon
 */
export async function agentExists(identifier: string): Promise<boolean> {
    const agent = await findAgentByIdentifier(identifier);
    return agent !== null;
}

/**
 * Récupère les informations de base d'un agent de manière sécurisée
 * @param identifier - L'identifiant de l'agent
 * @returns Informations de base ou null
 */
export async function getAgentBasicInfo(identifier: string) {
    const agent = await findAgentByIdentifier(identifier);

    if (!agent) {
        return null;
    }

    return {
        _id: agent._id,
        bungieId: agent.bungieId,
        agentName: agent.protocol?.agentName,
        uniqueName: agent.bungieUser?.uniqueName,
        displayName: agent.bungieUser?.displayName,
        role: agent.protocol?.role,
        clearanceLevel: agent.protocol?.clearanceLevel
    };
}

/**
 * Valide qu'un identifiant est dans un format acceptable
 * @param identifier - L'identifiant à valider
 * @returns Object avec isValid et le type détecté
 */
export function validateIdentifier(identifier: string): {
    isValid: boolean;
    type: AgentIdentifier['type'];
    error?: string;
} {
    if (!identifier || typeof identifier !== 'string') {
        return {
            isValid: false,
            type: 'unknown',
            error: 'Identifier must be a non-empty string'
        };
    }

    const trimmed = identifier.trim();

    if (trimmed.length === 0) {
        return {
            isValid: false,
            type: 'unknown',
            error: 'Identifier cannot be empty'
        };
    }

    if (trimmed.length > 200) {
        return {
            isValid: false,
            type: 'unknown',
            error: 'Identifier too long (max 200 characters)'
        };
    }

    const id = detectIdentifierType(trimmed);

    if (id.type === 'unknown') {
        return {
            isValid: false,
            type: 'unknown',
            error: 'Unable to detect identifier type'
        };
    }

    return {
        isValid: true,
        type: id.type
    };
}