import { Agent } from "../models/agent.model";

export class AgentStatsService {
    async syncAgentStats(agentId: string) {
        const agent = await Agent.findById(agentId).lean();
        if (!agent) throw new Error("Agent not found");

        const challenges = agent.challenges || [];

        let totalChallenges = challenges.length;
        let totalEmblemsAvailable = 0;
        let emblemsUnlocked = 0;
        let activeEmblems = 0;
        let completedEmblems = 0;
        let fragmentsCollected = 0;
        let totalFragments = 0;

        for (const challenge of challenges) {
            for (const emblem of challenge.emblems || []) {
                const collected = emblem.unlockedFragments?.length || 0;
                fragmentsCollected += collected;
                totalFragments += emblem.totalFragments || 9;
                totalEmblemsAvailable++;

                if (collected >= (emblem.totalFragments || 9)) {
                    emblemsUnlocked++;
                    completedEmblems++;
                } else if (collected > 0) {
                    activeEmblems++;
                }
            }
        }

        await Agent.findByIdAndUpdate(agentId, {
            $set: {
                "protocol.stats.totalChallenges": totalChallenges,
                "protocol.stats.totalEmblemsAvailable": totalEmblemsAvailable,
                "protocol.stats.emblemsUnlocked": emblemsUnlocked,
                "protocol.stats.completedEmblems": completedEmblems,
                "protocol.stats.activeEmblems": activeEmblems,
                "protocol.stats.fragmentsCollected": fragmentsCollected,
                "protocol.stats.totalFragments": totalFragments,
                "protocol.stats.lastSyncAt": new Date()
            }
        });

        return {
            totalChallenges,
            totalEmblemsAvailable,
            emblemsUnlocked,
            completedEmblems,
            activeEmblems,
            fragmentsCollected,
            totalFragments
        };
    }
}

export const agentStatsService = new AgentStatsService();
