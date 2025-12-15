import { z } from 'zod';
import { PaginationSchema, BooleanFilterSchema } from './common.schema';

export const BadgeRarityEnum = z.enum([
    'COMMON',
    'UNCOMMON',
    'RARE',
    'LEGENDARY',
    'EXOTIC'
]);

export const CreateBadgeSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be at most 100 characters long'),

    description: z.string()
        .max(500, 'Description too long')
        .optional()
        .default(''),

    rarity: BadgeRarityEnum
        .optional()
        .default('COMMON'),

    icon: z.string()
        .url('Invalid icon URL')
        .optional()
        .default(''),

    obtainable: z.boolean()
        .optional()
        .default(true),

    linkedTier: z.number()
        .int()
        .min(1)
        .max(5)
        .optional(),

    linkedTimeline: z.string()
        .optional()
});

export const UpdateBadgeSchema = CreateBadgeSchema.partial();

export const GetBadgesQuerySchema = PaginationSchema.extend({
    rarity: BadgeRarityEnum.optional(),
    obtainable: BooleanFilterSchema,
    linkedTier: z.string()
        .optional()
        .transform(val => val ? parseInt(val) : undefined),
    linkedTimeline: z.string().optional()
});

export const GiftBadgeSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required')
});

export const GiftBadgeBatchSchema = z.object({
    agentIds: z.array(z.string().min(1))
        .min(1, 'At least one agent is required')
        .max(100, 'Maximum 100 agents per batch')
});

export const GiftBadgesToAgentSchema = z.object({
    badgeIds: z.array(z.string().min(1))
        .min(1, 'At least one badge is required')
        .max(50, 'Maximum 50 badges per operation')
});

export type CreateBadgeInput = z.infer<typeof CreateBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof UpdateBadgeSchema>;
export type GetBadgesQuery = z.infer<typeof GetBadgesQuerySchema>;
export type GiftBadgeInput = z.infer<typeof GiftBadgeSchema>;
export type GiftBadgeBatchInput = z.infer<typeof GiftBadgeBatchSchema>;
export type GiftBadgesToAgentInput = z.infer<typeof GiftBadgesToAgentSchema>;

