import { Timeline } from "../models/timeline.model";
import { ITimeline } from "../types/timeline";
import { Agent } from "../models/agent.model";
import { EmblemModel } from "../models/emblem.model";
import { LoreModel } from "../models/lore.model";
import { Badge } from "../models/badge.model";
import { logger } from "../utils";

export class TimelineService {
    private generateCodePattern(targetCode: string[]): any {
        const sections = ['AAA', 'BBB', 'CCC', 'DDD'];
        const pattern: any = {};

        targetCode.forEach((code: string, index: number) => {
            if (code.length === 3 && sections[index]) {
                const sectionKey = sections[index];
                const letter = sectionKey.charAt(0);

                pattern[sectionKey] = {
                    [`${letter}1`]: code.charAt(0),
                    [`${letter}2`]: code.charAt(1),
                    [`${letter}3`]: code.charAt(2)
                };
            }
        });

        return pattern;
    }

    async createTimeline(timelineData: Partial<ITimeline>): Promise<any> {
        try {

            if (timelineData.emblemId && timelineData.emblemId.length > 0) {
                const emblems = await EmblemModel.find({
                    emblemId: { $in: timelineData.emblemId }
                });

                if (emblems.length !== timelineData.emblemId.length) {
                    const foundIds = emblems.map((e: any) => e.emblemId);
                    const missingIds = timelineData.emblemId.filter(id => !foundIds.includes(id));

                    return {
                        success: false,
                        message: `Emblems not found: ${missingIds.join(', ')}`
                    };
                }

                const emblemCode = emblems[0].code;

                if (emblemCode) {
                    const targetCode = emblemCode.split('-');
                    if (!timelineData.code) {
                        timelineData.code = {} as any;
                    }

                    const codeRef = timelineData.code as any;
                    codeRef.targetCode = targetCode;
                    codeRef.pattern = this.generateCodePattern(targetCode);
                }
            }

            const timeline = await Timeline.create(timelineData);
            return {
                success: true,
                timeline
            };
        } catch (error: any) {
            throw new Error(`Error during creation of the timeline: ${error.message}`);
        }
    }

    async getTimelineById(timelineId: string): Promise<any> {
        try {
            const timeline = await Timeline.findOne({ timelineId }).lean();

            if (!timeline) {
                return {
                    success: false,
                    message: "Timeline not found"
                };
            }

            return {
                success: true,
                timeline
            };
        } catch (error: any) {
            throw new Error(`Error during retrieval: ${error.message}`);
        }
    }

    async getAgentTimelineProgress(agentId: string, timelineId: string): Promise<any> {
        try {
            const timeline = await Timeline.findOne({ timelineId }).lean();
            if (!timeline) {
                return { success: false, message: "Timeline not found" };
            }

            const agent = await Agent.findById(agentId).lean();
            if (!agent) {
                return { success: false, message: "Agent not found" };
            }

            const agentTimeline = agent.timelines?.find((t: any) => t.timelineId === timelineId);
            if (!agentTimeline) {
                return { success: false, message: "You do not have access to this timeline" };
            }

            const emblemProgress = this.buildEmblemProgress(
                timeline.code?.pattern || {},
                timeline.code?.targetCode || [],
                agentTimeline.fragmentsFound || []
            );

            return {
                success: true,
                timeline: {
                    timelineId: timeline.timelineId,
                    name: timeline.name,
                    description: timeline.description,
                    tier: timeline.tier,
                    status: timeline.status,
                    emblemId: timeline.emblemId
                },
                progress: {
                    fragmentsFound: agentTimeline.fragmentsFound || [],
                    fragmentsCollected: agentTimeline.fragmentsCollected || 0,
                    keysFound: agentTimeline.keysFound || [],
                    entriesResolved: agentTimeline.entriesResolved || [],
                    completed: agentTimeline.completed || false,
                    completedAt: agentTimeline.completedAt
                },
                emblemProgress
            };
        } catch (error: any) {
            throw new Error(`Error during retrieval: ${error.message}`);
        }
    }

    private buildEmblemProgress(pattern: any, targetCode: string[], fragmentsFound: string[]): any {
        const sections = ['AAA', 'BBB', 'CCC', 'DDD'];
        const revealedPattern: any = {};
        let displayCode = '';
        let totalFragments = 0;
        let foundCount = 0;

        sections.forEach((section, sectionIndex) => {
            if (!pattern[section]) return;

            const sectionPattern = pattern[section];
            const sectionDisplay: string[] = [];
            revealedPattern[section] = {};

            Object.keys(sectionPattern).forEach((fragmentKey) => {
                totalFragments++;
                const isFound = fragmentsFound.includes(fragmentKey);

                if (isFound) {
                    foundCount++;
                    revealedPattern[section][fragmentKey] = sectionPattern[fragmentKey];
                    sectionDisplay.push(sectionPattern[fragmentKey]);
                } else {
                    revealedPattern[section][fragmentKey] = '?';
                    sectionDisplay.push('?');
                }
            });

            if (sectionIndex > 0 && displayCode) displayCode += ' | ';
            displayCode += sectionDisplay.join('-');
        });

        return {
            format: targetCode.length === 4 ? 'AAA-BBB-CCC-DDD' : 'AAA-BBB-CCC',
            pattern: revealedPattern,
            displayCode,
            collected: foundCount,
            total: totalFragments,
            progress: totalFragments > 0 ? Math.round((foundCount / totalFragments) * 100) : 0,
            canClaim: foundCount === totalFragments && totalFragments > 0
        };
    }

    async getAllTimelines(): Promise<any> {
        try {
            const timelines = await Timeline.find().lean();

            return {
                success: true,
                timelines,
                count: timelines.length
            };
        } catch (error: any) {
            throw new Error(`Error during retrieval of timelines: ${error.message}`);
        }
    }

    async updateTimeline(timelineId: string, updateData: Partial<ITimeline>): Promise<any> {
        try {
            const timeline = await Timeline.findOneAndUpdate(
                { timelineId },
                { $set: updateData },
                { new: true }
            );

            if (!timeline) {
                return {
                    success: false,
                    message: "Timeline not found"
                };
            }

            return {
                success: true,
                timeline
            };
        } catch (error: any) {
            throw new Error(`Error during update: ${error.message}`);
        }
    }

    async deleteTimeline(timelineId: string): Promise<any> {
        try {
            const timeline = await Timeline.findOneAndDelete({ timelineId });

            if (!timeline) {
                return {
                    success: false,
                    message: "Timeline not found"
                };
            }

            return {
                success: true,
                message: "Timeline successfully deleted"
            };
        } catch (error: any) {
            throw new Error(`Error during deletion: ${error.message}`);
        }
    }

    async getAvailableTimelines(): Promise<any> {
        try {
            const timelines = await Timeline.find({
                status: "OPEN",
                "stateFlags.isDeleted": false
            })
                .select('timelineId name description tier code.format')
                .lean();

            return {
                success: true,
                timelines,
                count: timelines.length
            };
        } catch (error: any) {
            throw new Error(`Error during retrieval of available timelines: ${error.message}`);
        }
    }

    async processInteraction(agentId: string, input: string, context: { timelineId?: string, entryId?: string } = {}): Promise<any> {
        try {
            const normalizedInput = input.trim();

            if (context.timelineId && context.entryId) {
                return this.handleEntrySolution(context.timelineId, context.entryId, agentId, normalizedInput);
            }

            if (context.timelineId) {
                const entryResult = await this.handleEntryAccess(context.timelineId, agentId, normalizedInput);
                if (entryResult.success) return entryResult;
            }

            return this.handleTimelineAccess(agentId, normalizedInput);

        } catch (error: any) {
            throw new Error(`Error during interaction: ${error.message}`);
        }
    }

    private async handleTimelineAccess(agentId: string, accessCode: string): Promise<any> {
        const timeline = await Timeline.findOne({
            "securityProtocol.accessCode": accessCode,
            status: "OPEN"
        });

        if (!timeline) {
            return { success: false, message: "Invalid code or unknown command" };
        }

        const agent = await Agent.findById(agentId);
        if (!agent) return { success: false, message: "Agent not found" };

        const existingTimeline = agent.timelines.find((t: any) => t.timelineId === timeline.timelineId);
        if (existingTimeline) {
            await this.updateAgentLocalization(agentId, timeline.timelineId, null);
            return {
                success: true,
                type: "TIMELINE_ACCESS",
                message: "Connection to the timeline established",
                data: {
                    timeline: {
                        timelineId: timeline.timelineId,
                        name: timeline.name,
                        description: timeline.description,
                        tier: timeline.tier,
                        codeFormat: timeline?.code?.format
                    },
                    progress: existingTimeline
                }
            };
        }

        agent.timelines.push({
            timelineMongoId: timeline._id,
            timelineId: timeline.timelineId,
            title: timeline.name,
            accessedAt: new Date(),
            lastUpdatedAt: new Date(),
            currentEntryId: null,
            fragmentsFound: [],
            fragmentsCollected: 0,
            keysFound: [],
            entriesResolved: [],
            completed: false
        } as any);

        agent.lastActivity = new Date();
        await agent.save();

        const existingParticipant = timeline.participants.find((p: any) => p.agentId === agentId);
        if (!existingParticipant) {
            timeline.participants.push({
                agentId: agentId,
                teamId: "",
                progress: 0,
                fragmentsFound: [],
                fragmentsCollected: 0,
                keysFound: [],
                lastActivityAt: new Date(),
                completed: false
            } as any);
            await timeline.save();
        }

        await this.updateAgentLocalization(agentId, timeline.timelineId, null);

        return {
            success: true,
            type: "TIMELINE_ACCESS",
            message: "Access granted. Welcome to the timeline.",
            data: {
                timeline: {
                    timelineId: timeline.timelineId,
                    name: timeline.name,
                    description: timeline.description,
                    tier: timeline.tier,
                    codeFormat: timeline?.code?.format
                },
                progress: {
                    fragmentsFound: [],
                    keysFound: [],
                    entriesResolved: []
                }
            }
        };
    }


    private async handleEntryAccess(timelineId: string, agentId: string, accessCode: string): Promise<any> {
        const timeline = await Timeline.findOne({ timelineId, status: "OPEN" });
        if (!timeline) return { success: false, message: "Timeline not found or locked" };

        const entry = this.findEntryByAccessCode(timeline.entries, accessCode);
        if (!entry) return { success: false, message: "Entry not found" };

        await this.updateAgentLocalization(agentId, timelineId, entry.entryId);

        return {
            success: true,
            type: "ENTRY_ACCESS",
            message: "Entry located",
            data: {
                entry: {
                    entryId: entry.entryId,
                    name: entry.name,
                    description: entry.description,
                    type: entry.type,
                    content: entry.content,
                    hasSolution: !!entry.solution
                }
            }
        };
    }

    private async handleEntrySolution(timelineId: string, entryId: string, agentId: string, solution: string): Promise<any> {
        const timeline = await Timeline.findOne({ timelineId, status: "OPEN" });
        if (!timeline) return { success: false, message: "Timeline not found or locked" };

        const entry = this.findEntryById(timeline.entries, entryId);
        if (!entry) return { success: false, message: "Entry not found" };

        if (entry.solution) {
            if (solution.trim().toUpperCase() !== entry.solution.trim().toUpperCase()) {
                return { success: false, message: "Incorrect solution" };
            }
        }

        const agent = await Agent.findById(agentId);
        if (!agent) return { success: false, message: "Agent not found" };

        const agentTimeline = agent.timelines.find((t: any) => t.timelineId === timelineId);
        if (!agentTimeline) return { success: false, message: "Access to timeline not authorized" };

        if (agentTimeline.entriesResolved.includes(entryId)) {
            return { success: false, message: "Already solved" };
        }

        if (entry.linkedFragment && entry.linkedFragment.length > 0) {
            const newFragments = entry.linkedFragment.filter((f: string) => !agentTimeline.fragmentsFound.includes(f));
            if (newFragments.length > 0) {
                agentTimeline.fragmentsFound.push(...newFragments);
                agentTimeline.fragmentsCollected = agentTimeline.fragmentsFound.length;
            }
        }
        if (entry.grantKeys && entry.grantKeys.length > 0) {
            const newKeys = entry.grantKeys.filter((k: string) => !agentTimeline.keysFound.includes(k));
            if (newKeys.length > 0) {
                agentTimeline.keysFound.push(...newKeys);
            }
        }

        let loresUnlocked: string[] = [];
        if (entry.linkedLore && entry.linkedLore.length > 0) {
            loresUnlocked = await this.unlockLinkedLores(entry.linkedLore, agentId);
        }

        agentTimeline.entriesResolved.push(entryId);
        agentTimeline.lastUpdatedAt = new Date();

        const completionResult = await this.checkAndApplyCompletion(agent, timeline, agentTimeline);

        await agent.save();

        const participant = timeline.participants.find((p: any) => p.agentId === agentId);
        if (participant) {
            participant.progress = completionResult.progress; // % de complétion
            participant.fragmentsFound = agentTimeline.fragmentsFound;
            participant.fragmentsCollected = agentTimeline.fragmentsCollected;
            participant.keysFound = agentTimeline.keysFound;
            participant.lastActivityAt = new Date();
            participant.completed = agentTimeline.completed;
            await timeline.save();
        }

        return {
            success: true,
            type: "ENTRY_SOLVED",
            message: "Entry validated!",
            data: {
                reward: {
                    fragments: entry.linkedFragment || [],
                    keys: entry.grantKeys || [],
                    loresUnlocked: loresUnlocked
                },
                completion: completionResult.justCompleted ? {
                    message: "TIMELINE COMPLETED! Congratulations Agent.",
                    rewards: completionResult.rewardsGiven
                } : null
            }
        };
    }

    private async unlockLinkedLores(loreIds: string[], agentId: string): Promise<string[]> {

        const unlockedLores: string[] = [];

        for (const loreId of loreIds) {
            try {
                const lore = await LoreModel.findOne({ loreId });

                if (!lore) {
                    logger.info(`Lore ${loreId} not found, skip...`);
                    continue;
                }

                const alreadyUnlocked = lore.unlockedBy?.some((u: any) => u.agentId === agentId);

                if (!alreadyUnlocked) {
                    await LoreModel.findOneAndUpdate(
                        { loreId },
                        {
                            $push: {
                                unlockedBy: {
                                    agentId,
                                    unlockedAt: new Date()
                                }
                            }
                        }
                    );
                    unlockedLores.push(loreId);
                    logger.info(`Lore ${loreId} unlocked for agent ${agentId}`);
                }
            } catch (error: any) {
                logger.error(`Error unlocking lore ${loreId}:`, error.message);
            }
        }

        return unlockedLores;
    }

    private async checkAndApplyCompletion(agent: any, timeline: any, agentTimeline: any): Promise<any> {
        let totalFragments = 0;
        const pattern = timeline.code?.pattern || {};
        const sections = ['AAA', 'BBB', 'CCC', 'DDD'];

        sections.forEach(section => {
            if (pattern[section]) {
                totalFragments += Object.keys(pattern[section]).length;
            }
        });

        const foundCount = agentTimeline.fragmentsFound.length;
        const progress = totalFragments > 0 ? Math.round((foundCount / totalFragments) * 100) : 0;

        if (agentTimeline.completed) {
            return { completed: true, justCompleted: false, progress: 100 };
        }

        if (foundCount >= totalFragments && totalFragments > 0) {
            agentTimeline.completed = true;
            agentTimeline.completedAt = new Date();

            const rewardsGiven: any = {
                roles: [],
                badges: [],
                emblems: []
            };
            if (timeline.rewards?.discordRoleId) {
                const role = timeline.rewards.discordRoleId.toUpperCase();
                if (!agent.protocol.roles.includes(role)) {
                    agent.protocol.roles.push(role);
                    rewardsGiven.roles.push(role);
                }
            }

            if (timeline.rewards?.badge) {
                const badgeId = timeline.rewards.badge;
                const badge = await Badge.findOne({ badgeId }).lean();
                if (badge) {
                    const hasBadge = agent.protocol.badges?.some(
                        (b: any) => b.badgeId?.toString() === (badge as any)._id.toString()
                    );
                    if (!hasBadge) {
                        agent.protocol.badges.push({
                            badgeId: (badge as any)._id,
                            obtainedAt: new Date()
                        });
                        rewardsGiven.badges.push(badge.name);
                    }
                }
            }

            if (timeline.rewards?.emblem && timeline.rewards.emblem.length > 0) {
                rewardsGiven.emblems = timeline.rewards.emblem;
            }

            timeline.status = "STABILIZED";
            timeline.stabilizedAt = {
                winnerType: "AGENT",
                winnerAgentId: agent.bungieId,
                completedAt: new Date()
            };
            await timeline.save();

            return {
                completed: true,
                justCompleted: true,
                progress: 100,
                rewardsGiven
            };
        }

        return { completed: false, justCompleted: false, progress };
    }

    private findEntryById(entries: any[], id: string): any {
        for (const entry of entries) {
            if (entry.entryId === id) return entry;
            if (entry.subEntries?.length > 0) {
                const found = this.findEntryById(entry.subEntries, id);
                if (found) return found;
            }
        }
        return null;
    }

    private findEntryByAccessCode(entries: any[], accessCode: string): any {
        const normalized = accessCode.trim().toUpperCase();
        for (const entry of entries) {
            if (entry.accessCode && String(entry.accessCode).trim().toUpperCase() === normalized) return entry;
            if (entry.subEntries?.length > 0) {
                const found = this.findEntryByAccessCode(entry.subEntries, accessCode);
                if (found) return found;
            }
        }
        return null;
    }


    async goHome(agentId: string): Promise<any> {
        await Agent.findByIdAndUpdate(agentId, {
            'protocol.timelineLocalization': {
                currentTimelineId: null,
                currentTimelineEntryId: null,
                lastSyncedAt: new Date()
            }
        });

        return {
            success: true,
            type: "NAVIGATION",
            action: "ROOT",
            message: "Retour au dashboard"
        };
    }

    async goBack(agentId: string, context: { timelineId?: string, entryId?: string }): Promise<any> {

        if (context.entryId) {
            await Agent.findByIdAndUpdate(agentId, {
                'protocol.timelineLocalization.currentTimelineEntryId': null,
                'protocol.timelineLocalization.lastSyncedAt': new Date()
            });

            return {
                success: true,
                type: "NAVIGATION",
                action: "BACK_TO_TIMELINE",
                message: "Back to timeline"
            };
        } else if (context.timelineId) {
            await Agent.findByIdAndUpdate(agentId, {
                'protocol.timelineLocalization': {
                    currentTimelineId: null,
                    currentTimelineEntryId: null,
                    lastSyncedAt: new Date()
                }
            });

            return {
                success: true,
                type: "NAVIGATION",
                action: "BACK_TO_ROOT",
                message: "Back to dashboard"
            };
        } else {
            return {
                success: false,
                type: "NAVIGATION",
                action: "ALREADY_AT_ROOT",
                message: "You are already at the dashboard"
            };
        }
    }

    private async updateAgentLocalization(agentId: string, timelineId: string | null, entryId: string | null): Promise<void> {

        await Agent.findByIdAndUpdate(agentId, {
            'protocol.timelineLocalization': {
                currentTimelineId: timelineId,
                currentTimelineEntryId: entryId,
                lastSyncedAt: new Date()
            }
        });
    }
}

export const timelineService = new TimelineService();
