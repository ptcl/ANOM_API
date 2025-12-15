import { Agent } from '../models/agent.model';
import { IAgentDocument } from '../types/agent';
import logger from './logger';
export interface AgentIdentifier {
    type: 'mongodb_id' | 'bungie_id' | 'unique_name' | 'unknown';
    value: string;
}

export function detectIdentifierType(identifier: string): AgentIdentifier {
    const trimmed = identifier.trim();

    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
        return { type: 'mongodb_id', value: trimmed };
    }

    if (/^\d+$/.test(trimmed)) {
        return { type: 'bungie_id', value: trimmed };
    }

    if (trimmed.length > 0) {
        return { type: 'unique_name', value: trimmed };
    }

    return { type: 'unknown', value: trimmed };
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function findAgentByIdentifier(identifier: string): Promise<IAgentDocument | null> {
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
        return null;
    }

    const id = detectIdentifierType(identifier);

    try {
        let agent: IAgentDocument | null = null;

        switch (id.type) {
            case 'mongodb_id':
                logger.info('Searching by MongoDB ID:', id.value);
                agent = await Agent.findById(id.value) as IAgentDocument;
                break;

            case 'bungie_id':
                logger.info('Searching by Bungie ID:', id.value);
                agent = await Agent.findOne({ bungieId: id.value }) as IAgentDocument;
                break;

            case 'unique_name':
                logger.info('Searching by uniqueName:', id.value);
                agent = await Agent.findOne({
                    'bungieUser.uniqueName': {
                        $regex: new RegExp(`^${escapeRegex(id.value)}$`, 'i')
                    }
                }) as IAgentDocument;

                if (!agent) {
                    logger.info('Agent not found with uniqueName, checking all agents...');
                    const allAgents = await Agent.find({}, {
                        'bungieUser.uniqueName': 1,
                        'bungieUser.displayName': 1,
                        'protocol.agentName': 1
                    }).limit(10);
                    logger.info('Sample of existing uniqueNames:',
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
                logger.warn('Unknown identifier type:', id.value);
                return null;
        }

        if (agent) {
            logger.info('Agent found:', {
                _id: agent._id,
                bungieId: agent.bungieId,
                uniqueName: agent.bungieUser?.uniqueName,
                agentName: agent.protocol?.agentName
            });
        }

        return agent;

    } catch (error: any) {
        logger.error('Error finding agent by identifier:', {
            identifier: id.value,
            type: id.type,
            error: error.message
        });
        return null;
    }
}

export async function findAgentsByIdentifiers(identifiers: string[]): Promise<IAgentDocument[]> {
    if (!Array.isArray(identifiers) || identifiers.length === 0) {
        return [];
    }

    const agents = await Promise.all(
        identifiers.map(id => findAgentByIdentifier(id))
    );

    return agents.filter((agent): agent is IAgentDocument => agent !== null);
}

export async function agentExists(identifier: string): Promise<boolean> {
    const agent = await findAgentByIdentifier(identifier);
    return agent !== null;
}

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
        roles: agent.protocol?.roles,
        clearanceLevel: agent.protocol?.clearanceLevel
    };
}

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