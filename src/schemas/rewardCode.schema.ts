import { z } from 'zod';
import { PaginationSchema } from './common.schema';

const RewardSchema = z.object({
    roles: z.array(z.string()).optional(),
    badgeIds: z.array(z.string()).optional()
}).refine(
    (data) => (data.roles?.length ?? 0) > 0 || (data.badgeIds?.length ?? 0) > 0,
    { message: 'At least one reward (role or badge) is required' }
);

export const GenerateRewardCodesSchema = z.object({
    count: z.number()
        .int()
        .min(1, 'Count must be at least 1')
        .max(1000, 'Count cannot exceed 1000'),

    word: z.string()
        .max(20, 'Word cannot exceed 20 characters')
        .optional(),

    rewards: RewardSchema,

    isUnique: z.boolean().optional().default(true),

    maxUses: z.number().int().min(1).optional(),

    description: z.string().max(500).optional(),

    expiresAt: z.string().datetime().optional()
});

export const RedeemRewardCodeSchema = z.object({
    code: z.string().min(1, 'Code is required')
});

export const GetRewardCodesQuerySchema = PaginationSchema.extend({
    status: z.enum(['active', 'expired', 'depleted']).optional()
});

export type GenerateRewardCodesInput = z.infer<typeof GenerateRewardCodesSchema>;
export type RedeemRewardCodeInput = z.infer<typeof RedeemRewardCodeSchema>;
export type GetRewardCodesQuery = z.infer<typeof GetRewardCodesQuerySchema>;
