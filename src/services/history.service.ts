import { Agent } from '../models/agent.model';
import { logToAgentFile } from '../utils/historyLogger';

export const HISTORY_ACTIONS = {
    // Profile
    PROFILE_UPDATE: 'PROFILE_UPDATE',
    THEME_CHANGE: 'THEME_CHANGE',
    SETTINGS_UPDATE: 'SETTINGS_UPDATE',
    SYNC_STATS: 'SYNC_STATS',
    // Badges
    BADGE_EARNED: 'BADGE_EARNED',
    BADGE_REMOVED: 'BADGE_REMOVED',
    // Lore
    LORE_UNLOCKED: 'LORE_UNLOCKED',
    LORE_READ: 'LORE_READ',
    // Timeline
    TIMELINE_STARTED: 'TIMELINE_STARTED',
    TIMELINE_COMPLETED: 'TIMELINE_COMPLETED',
    FRAGMENT_COLLECTED: 'FRAGMENT_COLLECTED',
    // Contracts
    CONTRACT_CREATED: 'CONTRACT_CREATED',
    CONTRACT_VALIDATED: 'CONTRACT_VALIDATED',
    CONTRACT_CANCELLED: 'CONTRACT_CANCELLED',
    // Divisions
    DIVISION_JOINED: 'DIVISION_JOINED',
    DIVISION_LEFT: 'DIVISION_LEFT',
    DIVISION_PROMOTED: 'DIVISION_PROMOTED',
    // Admin (founder only visibility)
    ROLE_ADDED: 'ROLE_ADDED',
    ROLE_REMOVED: 'ROLE_REMOVED',
    ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
    ACCOUNT_REACTIVATED: 'ACCOUNT_REACTIVATED'
} as const;

export type HistoryAction = typeof HISTORY_ACTIONS[keyof typeof HISTORY_ACTIONS];

const ADMIN_ACTIONS = [
    HISTORY_ACTIONS.ROLE_ADDED,
    HISTORY_ACTIONS.ROLE_REMOVED,
    HISTORY_ACTIONS.ACCOUNT_DEACTIVATED,
    HISTORY_ACTIONS.ACCOUNT_REACTIVATED
];

const MAX_HISTORY_ENTRIES = 200;

interface HistoryEntry {
    action: HistoryAction;
    targetId?: string;
    timestamp: Date;
    success?: boolean;
    meta?: Record<string, any>;
}

interface LogHistoryOptions {
    targetId?: string;
    success?: boolean;
    meta?: Record<string, any>;
}

export async function logAgentHistory(
    agentId: string,
    action: HistoryAction,
    options: LogHistoryOptions = {}
): Promise<void> {
    try {
        const entry: HistoryEntry = {
            action,
            timestamp: new Date(),
            ...options
        };

        const agent = await Agent.findById(agentId).select('bungieId protocol.history').lean();
        if (!agent) return;

        // Log to file (VPS archive)
        await logToAgentFile(agent.bungieId, entry);

        // Log to MongoDB (with limit)
        await Agent.findByIdAndUpdate(agentId, {
            $push: {
                'protocol.history': {
                    $each: [entry],
                    $slice: -MAX_HISTORY_ENTRIES
                }
            }
        });
    } catch (error) {
        console.error('Failed to log agent history:', error);
    }
}

export async function getAgentHistory(
    agentId: string,
    options: { limit?: number; skip?: number; isFounder?: boolean } = {}
): Promise<HistoryEntry[]> {
    const { limit = 50, skip = 0, isFounder = false } = options;

    const agent = await Agent.findById(agentId)
        .select('protocol.history')
        .lean();

    if (!agent?.protocol?.history) return [];

    let history = (agent.protocol.history as HistoryEntry[])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter admin actions for non-founders
    if (!isFounder) {
        history = history.filter(h => !ADMIN_ACTIONS.includes(h.action as any));
    }

    return history.slice(skip, skip + limit);
}

export async function getAgentHistoryCount(
    agentId: string,
    isFounder: boolean = false
): Promise<number> {
    const agent = await Agent.findById(agentId)
        .select('protocol.history')
        .lean();

    if (!agent?.protocol?.history) return 0;

    const history = agent.protocol.history as HistoryEntry[];

    if (!isFounder) {
        return history.filter(h => !ADMIN_ACTIONS.includes(h.action as any)).length;
    }

    return history.length;
}
