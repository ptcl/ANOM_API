import { Badge } from "../models/badge.model";
import { Timeline } from "../models/timeline.model";
import { findAgentByIdentifier } from "../utils/verifyAgent.helper";
import { CreateBadgeInput, UpdateBadgeInput, GetBadgesQuery } from "../schemas/badge.schema";
import logger from "../utils/logger";

export class BadgeService {

    async getAllBadges(filters: GetBadgesQuery): Promise<any> {
        try {
            const query: any = {};

            if (filters.rarity) {
                query.rarity = filters.rarity;
            }
            if (filters.obtainable !== undefined) {
                query.obtainable = filters.obtainable;
            }
            if (filters.linkedTier) {
                query.linkedTier = filters.linkedTier;
            }
            if (filters.linkedTimeline) {
                query.linkedTimeline = filters.linkedTimeline;
            }

            const skip = (filters.page - 1) * filters.limit;

            const [badges, total] = await Promise.all([
                Badge.find(query)
                    .sort({ rarity: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(filters.limit)
                    .lean(),
                Badge.countDocuments(query)
            ]);

            return {
                success: true,
                data: {
                    badges,
                    pagination: {
                        page: filters.page,
                        limit: filters.limit,
                        total,
                        pages: Math.ceil(total / filters.limit)
                    }
                }
            };
        } catch (error: any) {
            logger.error('Error fetching badges', { error: error.message });
            throw error;
        }
    }

    async getBadgeById(badgeId: string): Promise<any> {
        try {
            if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
                return { success: false, error: 'Invalid badge ID' };
            }

            const badge = await Badge.findOne({ badgeId: badgeId.trim() }).lean();

            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            return { success: true, data: { badge } };
        } catch (error: any) {
            throw error;
        }
    }

    async createBadge(data: CreateBadgeInput): Promise<any> {
        try {
            if (data.linkedTimeline) {
                const timelineExists = await Timeline.findOne({ timelineId: data.linkedTimeline }).lean();
                if (!timelineExists) {
                    return { success: false, error: `Timeline '${data.linkedTimeline}' not found` };
                }
            }

            const newBadge = new Badge({
                name: data.name,
                description: data.description,
                rarity: data.rarity,
                icon: data.icon,
                obtainable: data.obtainable,
                linkedTier: data.linkedTier,
                linkedTimeline: data.linkedTimeline
            });

            await newBadge.save();

            logger.info('Badge created', { badgeId: newBadge.badgeId, name: data.name });

            return {
                success: true,
                data: { badge: newBadge },
                message: 'Badge created successfully'
            };
        } catch (error: any) {
            logger.error('Error creating badge', { error: error.message, name: data.name });
            throw error;
        }
    }

    async updateBadge(badgeId: string, updates: UpdateBadgeInput): Promise<any> {
        try {
            if (updates.linkedTimeline) {
                const timelineExists = await Timeline.findOne({ timelineId: updates.linkedTimeline }).lean();
                if (!timelineExists) {
                    return { success: false, error: `Timeline '${updates.linkedTimeline}' not found` };
                }
            }

            const badge = await Badge.findOneAndUpdate(
                { badgeId },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            logger.info('Badge updated', { badgeId });

            return { success: true, data: { badge } };
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                return {
                    success: false,
                    error: 'Validation error',
                    details: Object.values(error.errors).map((e: any) => e.message)
                };
            }
            logger.error('Error updating badge', { badgeId, error: error.message });
            throw error;
        }
    }

    async deleteBadge(badgeId: string): Promise<any> {
        try {
            if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
                return { success: false, error: 'Invalid badge ID' };
            }

            const badge = await Badge.findOneAndDelete({ badgeId: badgeId.trim() });

            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            return {
                success: true,
                message: 'Badge deleted successfully',
                data: { badge }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async getBadgeStats(): Promise<any> {
        try {
            const [total, byRarity, obtainableCount, unobtainableCount] = await Promise.all([
                Badge.countDocuments(),
                Badge.aggregate([
                    { $group: { _id: '$rarity', count: { $sum: 1 } } }
                ]),
                Badge.countDocuments({ obtainable: true }),
                Badge.countDocuments({ obtainable: false })
            ]);

            const rarityStats = byRarity.reduce((acc: any, item: any) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            return {
                success: true,
                data: {
                    stats: {
                        total,
                        obtainable: obtainableCount,
                        unobtainable: unobtainableCount,
                        byRarity: {
                            COMMON: rarityStats.COMMON || 0,
                            UNCOMMON: rarityStats.UNCOMMON || 0,
                            RARE: rarityStats.RARE || 0,
                            LEGENDARY: rarityStats.LEGENDARY || 0,
                            EXOTIC: rarityStats.EXOTIC || 0
                        }
                    }
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async giftBadge(badgeId: string, agentId: string): Promise<any> {
        try {
            if (!badgeId || badgeId.trim().length === 0) {
                return { success: false, error: 'Badge ID is required' };
            }
            if (!agentId || agentId.trim().length === 0) {
                return { success: false, error: 'Agent ID is required' };
            }

            const badge = await Badge.findOne({ badgeId: badgeId.trim() }).lean();
            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            const agent = await findAgentByIdentifier(agentId);
            if (!agent) {
                return { success: false, error: 'Agent not found', notFound: true };
            }

            if (!agent.protocol) {
                return { success: false, error: 'Agent protocol is incomplete' };
            }

            const hasBadge = agent.protocol.badges?.some(
                (b: any) => b.badgeId?.toString() === badge._id.toString()
            );

            if (hasBadge) {
                return {
                    success: false,
                    error: 'Agent already has this badge',
                    alreadyHas: true,
                    data: {
                        agentName: agent.protocol.agentName,
                        badgeName: badge.name
                    }
                };
            }

            agent.protocol.badges.push({
                badgeId: badge._id,
                obtainedAt: new Date()
            } as any);

            agent.updatedAt = new Date();
            await agent.save();

            return {
                success: true,
                message: 'Badge successfully gifted to agent',
                data: {
                    badge: {
                        badgeId: badge.badgeId,
                        name: badge.name,
                        rarity: badge.rarity
                    },
                    agent: {
                        agentName: agent.protocol.agentName,
                        bungieId: agent.bungieId,
                        uniqueName: agent.bungieUser?.uniqueName,
                        totalBadges: agent.protocol.badges.length
                    },
                    obtainedAt: agent.protocol.badges[agent.protocol.badges.length - 1].obtainedAt
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async revokeBadge(badgeId: string, agentId: string): Promise<any> {
        try {
            if (!badgeId || badgeId.trim().length === 0) {
                return { success: false, error: 'Badge ID is required' };
            }
            if (!agentId || agentId.trim().length === 0) {
                return { success: false, error: 'Agent ID is required' };
            }

            const badge = await Badge.findOne({ badgeId: badgeId.trim() });
            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            const agent = await findAgentByIdentifier(agentId);
            if (!agent) {
                return { success: false, error: 'Agent not found', notFound: true };
            }

            if (!agent.protocol) {
                return { success: false, error: 'Agent protocol is incomplete' };
            }

            const badgeIndex = agent.protocol.badges?.findIndex(
                (b: any) => b.badgeId?.toString() === badge._id.toString()
            ) ?? -1;

            if (badgeIndex === -1) {
                return {
                    success: false,
                    error: 'Agent does not have this badge',
                    notHasBadge: true,
                    data: {
                        agentName: agent.protocol.agentName,
                        badgeName: badge.name
                    }
                };
            }

            const removedBadge = agent.protocol.badges[badgeIndex];
            agent.protocol.badges.splice(badgeIndex, 1);

            agent.updatedAt = new Date();
            await agent.save();

            return {
                success: true,
                message: 'Badge successfully revoked from agent',
                data: {
                    badge: {
                        badgeId: badge.badgeId,
                        name: badge.name,
                        rarity: badge.rarity
                    },
                    agent: {
                        agentName: agent.protocol.agentName,
                        bungieId: agent.bungieId,
                        totalBadges: agent.protocol.badges.length
                    },
                    wasObtainedAt: removedBadge.obtainedAt
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async giftBadgeBatch(badgeId: string, agentIds: string[]): Promise<any> {
        try {
            if (!badgeId || badgeId.trim().length === 0) {
                return { success: false, error: 'Badge ID is required' };
            }
            if (!Array.isArray(agentIds) || agentIds.length === 0) {
                return { success: false, error: 'Agent IDs array is required' };
            }

            const badge = await Badge.findOne({ badgeId: badgeId.trim() }).lean();
            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            const succeeded: any[] = [];
            const failed: any[] = [];

            for (const agentId of agentIds) {
                try {
                    const result = await this.giftBadge(badgeId, agentId);
                    if (result.success) {
                        succeeded.push({
                            agentId,
                            agentName: result.data.agent.agentName
                        });
                    } else {
                        failed.push({
                            agentId,
                            reason: result.error
                        });
                    }
                } catch (err: any) {
                    failed.push({
                        agentId,
                        reason: err.message
                    });
                }
            }

            return {
                success: true,
                message: `Gifted badge to ${succeeded.length}/${agentIds.length} agents`,
                data: {
                    badge: {
                        badgeId: badge.badgeId,
                        name: badge.name,
                        rarity: badge.rarity
                    },
                    succeeded,
                    failed,
                    stats: {
                        total: agentIds.length,
                        succeeded: succeeded.length,
                        failed: failed.length
                    }
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async revokeBadgeBatch(badgeId: string, agentIds: string[]): Promise<any> {
        try {
            if (!badgeId || badgeId.trim().length === 0) {
                return { success: false, error: 'Badge ID is required' };
            }
            if (!Array.isArray(agentIds) || agentIds.length === 0) {
                return { success: false, error: 'Agent IDs array is required' };
            }

            const badge = await Badge.findOne({ badgeId: badgeId.trim() }).lean();
            if (!badge) {
                return { success: false, error: 'Badge not found', notFound: true };
            }

            const succeeded: any[] = [];
            const failed: any[] = [];

            for (const agentId of agentIds) {
                try {
                    const result = await this.revokeBadge(badgeId, agentId);
                    if (result.success) {
                        succeeded.push({
                            agentId,
                            agentName: result.data.agent.agentName
                        });
                    } else {
                        failed.push({
                            agentId,
                            reason: result.error
                        });
                    }
                } catch (err: any) {
                    failed.push({
                        agentId,
                        reason: err.message
                    });
                }
            }

            return {
                success: true,
                message: `Revoked badge from ${succeeded.length}/${agentIds.length} agents`,
                data: {
                    badge: {
                        badgeId: badge.badgeId,
                        name: badge.name,
                        rarity: badge.rarity
                    },
                    succeeded,
                    failed,
                    stats: {
                        total: agentIds.length,
                        succeeded: succeeded.length,
                        failed: failed.length
                    }
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async giftBadgesToAgent(agentId: string, badgeIds: string[]): Promise<any> {
        try {
            if (!agentId || agentId.trim().length === 0) {
                return { success: false, error: 'Agent ID is required' };
            }
            if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
                return { success: false, error: 'Badge IDs array is required' };
            }

            const agent = await findAgentByIdentifier(agentId);
            if (!agent) {
                return { success: false, error: 'Agent not found', notFound: true };
            }

            const succeeded: any[] = [];
            const failed: any[] = [];

            for (const badgeId of badgeIds) {
                try {
                    const result = await this.giftBadge(badgeId, agentId);
                    if (result.success) {
                        succeeded.push({
                            badgeId,
                            badgeName: result.data.badge.name
                        });
                    } else {
                        failed.push({
                            badgeId,
                            reason: result.error
                        });
                    }
                } catch (err: any) {
                    failed.push({
                        badgeId,
                        reason: err.message
                    });
                }
            }

            return {
                success: true,
                message: `Gifted ${succeeded.length}/${badgeIds.length} badges to agent`,
                data: {
                    agent: {
                        agentName: agent.protocol?.agentName,
                        bungieId: agent.bungieId,
                        totalBadges: agent.protocol?.badges?.length || 0
                    },
                    succeeded,
                    failed,
                    stats: {
                        total: badgeIds.length,
                        succeeded: succeeded.length,
                        failed: failed.length
                    }
                }
            };
        } catch (error: any) {
            throw error;
        }
    }

    async revokeBadgesFromAgent(agentId: string, badgeIds: string[]): Promise<any> {
        try {
            if (!agentId || agentId.trim().length === 0) {
                return { success: false, error: 'Agent ID is required' };
            }
            if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
                return { success: false, error: 'Badge IDs array is required' };
            }

            const agent = await findAgentByIdentifier(agentId);
            if (!agent) {
                return { success: false, error: 'Agent not found', notFound: true };
            }

            const succeeded: any[] = [];
            const failed: any[] = [];

            for (const badgeId of badgeIds) {
                try {
                    const result = await this.revokeBadge(badgeId, agentId);
                    if (result.success) {
                        succeeded.push({
                            badgeId,
                            badgeName: result.data.badge.name
                        });
                    } else {
                        failed.push({
                            badgeId,
                            reason: result.error
                        });
                    }
                } catch (err: any) {
                    failed.push({
                        badgeId,
                        reason: err.message
                    });
                }
            }

            return {
                success: true,
                message: `Revoked ${succeeded.length}/${badgeIds.length} badges from agent`,
                data: {
                    agent: {
                        agentName: agent.protocol?.agentName,
                        bungieId: agent.bungieId,
                        totalBadges: agent.protocol?.badges?.length || 0
                    },
                    succeeded,
                    failed,
                    stats: {
                        total: badgeIds.length,
                        succeeded: succeeded.length,
                        failed: failed.length
                    }
                }
            };
        } catch (error: any) {
            throw error;
        }
    }
}

export const badgeService = new BadgeService();
