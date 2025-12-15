import { Agent } from "../models/agent.model";
import { logger } from "../utils";

export class AgentStatsService {
    async syncAgentStats(agentId: string) {
        const agent = await Agent.findById(agentId).lean();
        if (!agent) throw new Error("Agent not found");

        let completedTimelines = 0;
        let timelinesFragmentsCollected = 0;

        const timelines = agent.timelines || [];

        for (const timeline of timelines) {
            timelinesFragmentsCollected += timeline.fragmentsCollected || 0;

            if (timeline.completed) {
                completedTimelines++;
            }
        }
        await Agent.findByIdAndUpdate(agentId, {
            $set: {
                "protocol.stats.completedTimelines": completedTimelines,
                "protocol.stats.fragmentsCollected": timelinesFragmentsCollected,
                "protocol.stats.lastSyncAt": new Date()
            },
            $unset: {
                "protocol.stats.totalChallenges": "",
                "protocol.stats.totalEmblemsAvailable": "",
                "protocol.stats.emblemsUnlocked": "",
                "protocol.stats.completedEmblems": "",
                "protocol.stats.activeEmblems": "",
                "protocol.stats.totalFragments": ""
            }
        });

        return {
            completedTimelines,
            timelinesFragmentsCollected
        };
    }
}
export class AgentMigrationService {
    private validFields = {
        protocol: {
            stats: [
                'completedTimelines',
                'fragmentsCollected',
                'lastFragmentUnlockedAt',
                'lastSyncAt'
            ],

        }
    };

    async cleanObsoleteFields(agentId: string) {
        const agent = await Agent.findById(agentId).lean();
        if (!agent) return;

        const unsetFields: any = {};

        const currentStats = agent.protocol?.stats || {};
        Object.keys(currentStats).forEach(key => {
            if (!this.validFields.protocol.stats.includes(key)) {
                unsetFields[`protocol.stats.${key}`] = "";
            }
        });

        if (Object.keys(unsetFields).length > 0) {
            await Agent.findByIdAndUpdate(agentId, { $unset: unsetFields });
            logger.info(`Cleaned ${Object.keys(unsetFields).length} obsolete fields for agent ${agentId}`);
        }
    }
}
export const agentStatsService = new AgentStatsService();
export const agentMigrationService = new AgentMigrationService();