import { RewardCode } from "../models/rewardCode.model";
import { Badge } from "../models/badge.model";
import { findAgentByIdentifier } from "../utils/verifyAgent.helper";
import { IGenerateRewardCodesInput, IRewardCode, IRewardCodeReward } from "../types/rewardCode";
import { v4 as uuidv4 } from "uuid";

function generateMixedCode(word?: string): string {
    const uuid = uuidv4().replace(/-/g, '').substring(0, 12).toLowerCase();

    if (!word || word.length === 0) {
        return uuid.toUpperCase();
    }

    const wordUpper = word.toUpperCase();
    const uuidChars = uuid.split('');
    const wordChars = wordUpper.split('');

    let result = '';
    let uuidIndex = 0;
    let wordIndex = 0;

    const totalLength = wordChars.length + uuidChars.length;
    const wordSpacing = Math.floor(totalLength / wordChars.length);

    for (let i = 0; i < totalLength; i++) {
        if (wordIndex < wordChars.length && i % wordSpacing === 0) {
            result += wordChars[wordIndex];
            wordIndex++;
        } else if (uuidIndex < uuidChars.length) {
            result += uuidChars[uuidIndex];
            uuidIndex++;
        }
    }

    while (wordIndex < wordChars.length) {
        result += wordChars[wordIndex];
        wordIndex++;
    }

    while (uuidIndex < uuidChars.length) {
        result += uuidChars[uuidIndex];
        uuidIndex++;
    }

    return result;
}

function generateCodeId(): string {
    return `RWCD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export class RewardCodeService {

    async generateCodes(input: IGenerateRewardCodesInput, creatorId: string): Promise<any> {
        try {
            const { count, word, rewards, isUnique = true, maxUses, description, expiresAt } = input;

            if (!count || count < 1 || count > 1000) {
                return { success: false, error: 'Count must be between 1 and 1000' };
            }

            if (!rewards || (!rewards.roles?.length && !rewards.badgeIds?.length)) {
                return { success: false, error: 'At least one reward (role or badge) is required' };
            }

            if (rewards.badgeIds?.length) {
                const existingBadges = await Badge.find({ badgeId: { $in: rewards.badgeIds } }).lean();
                const existingIds = existingBadges.map((b: any) => b.badgeId);
                const missingBadges = rewards.badgeIds.filter(id => !existingIds.includes(id));

                if (missingBadges.length > 0) {
                    return {
                        success: false,
                        error: `Badges not found: ${missingBadges.join(', ')}`
                    };
                }
            }

            const generatedCodes: any[] = [];
            const failedCodes: any[] = [];

            for (let i = 0; i < count; i++) {
                try {
                    let code = generateMixedCode(word);
                    let attempts = 0;
                    const maxAttempts = 10;

                    while (await RewardCode.findOne({ code }) && attempts < maxAttempts) {
                        code = generateMixedCode(word);
                        attempts++;
                    }

                    if (attempts >= maxAttempts) {
                        failedCodes.push({ reason: 'Could not generate unique code' });
                        continue;
                    }

                    const codeData: Partial<IRewardCode> = {
                        codeId: generateCodeId(),
                        code,
                        word: word?.toUpperCase(),
                        rewards: {
                            roles: rewards.roles || [],
                            badgeIds: rewards.badgeIds || []
                        },
                        isUnique,
                        maxUses: isUnique ? 1 : maxUses,
                        currentUses: 0,
                        description,
                        createdBy: creatorId,
                        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                        usedBy: []
                    };

                    const newCode = await RewardCode.create(codeData);
                    generatedCodes.push({
                        codeId: newCode.codeId,
                        code: newCode.code
                    });

                } catch (err: any) {
                    failedCodes.push({ reason: err.message });
                }
            }

            return {
                success: true,
                data: {
                    generated: generatedCodes,
                    failed: failedCodes,
                    stats: {
                        requested: count,
                        succeeded: generatedCodes.length,
                        failed: failedCodes.length
                    }
                },
                message: `Generated ${generatedCodes.length}/${count} codes`
            };

        } catch (error: any) {
            throw error;
        }
    }

    async getAllCodes(filters?: { word?: string; isUnique?: string; expired?: string; page?: string; limit?: string; }): Promise<any> {
        try {
            const query: any = {};

            if (filters?.word) {
                query.word = filters.word.toUpperCase();
            }

            if (filters?.isUnique !== undefined) {
                query.isUnique = filters.isUnique === 'true';
            }

            if (filters?.expired === 'true') {
                query.expiresAt = { $lt: new Date() };
            } else if (filters?.expired === 'false') {
                query.$or = [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gte: new Date() } }
                ];
            }

            const pageNum = Math.max(1, parseInt(filters?.page || '1', 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(filters?.limit || '50', 10)));
            const skip = (pageNum - 1) * limitNum;

            const [codes, total] = await Promise.all([
                RewardCode.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                RewardCode.countDocuments(query)
            ]);

            return {
                success: true,
                data: {
                    codes,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: Math.ceil(total / limitNum)
                    }
                }
            };

        } catch (error: any) {
            throw error;
        }
    }

    async getCodeById(codeId: string): Promise<any> {
        try {
            if (!codeId) {
                return { success: false, error: 'Code ID required' };
            }

            const code = await RewardCode.findOne({ codeId }).lean();

            if (!code) {
                return { success: false, error: 'Code not found', notFound: true };
            }

            return { success: true, data: { code } };

        } catch (error: any) {
            throw error;
        }
    }

    async deleteCode(codeId: string): Promise<any> {
        try {
            if (!codeId) {
                return { success: false, error: 'Code ID required' };
            }

            const code = await RewardCode.findOneAndDelete({ codeId });

            if (!code) {
                return { success: false, error: 'Code not found', notFound: true };
            }

            return {
                success: true,
                message: 'Code deleted successfully',
                data: { code }
            };

        } catch (error: any) {
            throw error;
        }
    }

    async redeemCode(code: string, agentId: string): Promise<any> {
        try {
            if (!code || code.trim().length === 0) {
                return { success: false, error: 'Code is required' };
            }

            const rewardCode = await RewardCode.findOne({ code: code.trim() });

            if (!rewardCode) {
                return { success: false, error: 'Invalid code', invalidCode: true };
            }

            if (rewardCode.expiresAt && new Date(rewardCode.expiresAt) < new Date()) {
                return { success: false, error: 'Code has expired', expired: true };
            }

            if (rewardCode.isUnique && rewardCode.currentUses >= 1) {
                return { success: false, error: 'Code has already been used', alreadyUsed: true };
            }

            if (!rewardCode.isUnique && rewardCode.maxUses && rewardCode.currentUses >= rewardCode.maxUses) {
                return { success: false, error: 'Code has reached maximum uses', maxUsesReached: true };
            }

            const alreadyUsedByAgent = rewardCode.usedBy?.some(
                (usage: any) => usage.agentId === agentId
            );

            if (alreadyUsedByAgent) {
                return { success: false, error: 'You have already used this code', alreadyUsedByYou: true };
            }

            const agent = await findAgentByIdentifier(agentId);

            if (!agent) {
                return { success: false, error: 'Agent not found', notFound: true };
            }

            if (!agent.protocol) {
                return { success: false, error: 'Agent protocol is incomplete' };
            }

            const rewardsGiven: any = {
                roles: [],
                badges: []
            };

            if (rewardCode.rewards?.roles?.length) {
                for (const role of rewardCode.rewards.roles) {
                    const roleUpper = role.toUpperCase();
                    if (!agent.protocol.roles.includes(roleUpper)) {
                        agent.protocol.roles.push(roleUpper);
                        rewardsGiven.roles.push(roleUpper);
                    }
                }
            }

            if (rewardCode.rewards?.badgeIds?.length) {
                for (const badgeId of rewardCode.rewards.badgeIds) {
                    const badge = await Badge.findOne({ badgeId }).lean();

                    if (badge) {
                        const hasBadge = agent.protocol.badges?.some(
                            (b: any) => b.badgeId?.toString() === (badge as any)._id.toString()
                        );

                        if (!hasBadge) {
                            agent.protocol.badges.push({
                                badgeId: (badge as any)._id,
                                obtainedAt: new Date()
                            } as any);
                            rewardsGiven.badges.push({
                                badgeId: badge.badgeId,
                                name: badge.name
                            });
                        }
                    }
                }
            }

            agent.updatedAt = new Date();
            await agent.save();

            rewardCode.currentUses += 1;
            rewardCode.usedBy.push({
                agentId: agent.bungieId,
                agentName: agent.protocol.agentName,
                usedAt: new Date()
            });
            await rewardCode.save();

            return {
                success: true,
                message: 'Code redeemed successfully!',
                data: {
                    rewards: rewardsGiven,
                    agent: {
                        agentName: agent.protocol.agentName,
                        totalRoles: agent.protocol.roles.length,
                        totalBadges: agent.protocol.badges.length
                    }
                }
            };

        } catch (error: any) {
            throw error;
        }
    }

    async getStats(): Promise<any> {
        try {
            const [total, uniqueCodes, multiUseCodes, expiredCodes, totalUses] = await Promise.all([
                RewardCode.countDocuments(),
                RewardCode.countDocuments({ isUnique: true }),
                RewardCode.countDocuments({ isUnique: false }),
                RewardCode.countDocuments({ expiresAt: { $lt: new Date() } }),
                RewardCode.aggregate([
                    { $group: { _id: null, total: { $sum: '$currentUses' } } }
                ])
            ]);

            return {
                success: true,
                data: {
                    stats: {
                        total,
                        uniqueCodes,
                        multiUseCodes,
                        expiredCodes,
                        activeUniqueCodes: uniqueCodes - await RewardCode.countDocuments({
                            isUnique: true,
                            currentUses: { $gte: 1 }
                        }),
                        totalRedemptions: totalUses[0]?.total || 0
                    }
                }
            };

        } catch (error: any) {
            throw error;
        }
    }
}

export const rewardCodeService = new RewardCodeService();
