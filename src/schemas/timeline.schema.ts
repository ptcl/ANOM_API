import { z } from 'zod';

export const TimelineStatusEnum = z.enum(['DRAFT', 'DELETED', 'OPEN', 'PROGRESS', 'ARCHIVED', 'CLOSED', 'STABILIZED']);
export const TimelineTierEnum = z.enum(['1', '2', '3', '4', '5']).transform(Number);
export const EntryTypeEnum = z.enum(['ENIGMA', 'FIREWALL', 'DATA_NODE']);
export const EntryStatusEnum = z.enum(['ACTIVE', 'LOCKED', 'SOLVED']);
export const EntryRewardEnum = z.enum(['FRAGMENT', 'INDEX', 'NONE']);

const EntryDialogsSchema = z.object({
    intro: z.array(z.string()).optional(),
    success: z.array(z.string()).optional(),
    failure: z.array(z.string()).optional()
}).optional();

const EntrySchema = z.object({
    entryId: z.string().min(1),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    type: EntryTypeEnum,
    accessCode: z.string().optional().default(''),
    solution: z.string().optional(),
    linkedFragment: z.array(z.string()).optional(),
    linkedLore: z.array(z.string()).optional(),
    reward: EntryRewardEnum.optional().default('NONE'),
    status: EntryStatusEnum.optional().default('ACTIVE'),
    dialogs: EntryDialogsSchema,
    grantKeys: z.array(z.string()).optional(),
    requiredKeys: z.array(z.string()).optional()
});

const TimelineCodeSchema = z.object({
    format: z.enum(['AAA-BBB-CCC', 'AAA-BBB-CCC-DDD']).optional(),
    pattern: z.any().optional(),
    targetCode: z.array(z.string()).optional()
}).optional();

const TimelineRewardSchema = z.object({
    discordRoleId: z.string().optional(),
    badge: z.string().optional(),
    emblem: z.array(z.string()).optional(),
    archivesEntry: z.boolean().optional(),
    indexAccess: z.boolean().optional(),
    specialFragment: z.boolean().optional(),
    irlObject: z.boolean().optional()
}).optional();

export const CreateTimelineSchema = z.object({
    timelineId: z.string().max(50).optional(),

    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Name cannot exceed 200 characters'),

    description: z.string().max(2000).optional(),

    tier: z.number().int().min(1).max(5).optional().default(1),

    isShared: z.boolean().optional().default(false),

    status: TimelineStatusEnum.optional().default('DRAFT'),

    code: TimelineCodeSchema,

    emblemId: z.array(z.string()).optional(),

    entries: z.array(EntrySchema).optional(),

    rewards: TimelineRewardSchema
});

export const UpdateTimelineSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    tier: z.number().int().min(1).max(5).optional(),
    isShared: z.boolean().optional(),
    status: TimelineStatusEnum.optional(),
    code: TimelineCodeSchema,
    emblemId: z.array(z.string()).optional(),
    entries: z.array(EntrySchema).optional(),
    rewards: TimelineRewardSchema
});

export const InteractTimelineSchema = z.object({
    input: z.string().min(1, 'Input is required'),
    context: z.object({
        timelineId: z.string().optional(),
        entryId: z.string().optional()
    }).optional()
});

export const GoBackSchema = z.object({
    timelineId: z.string().optional(),
    entryId: z.string().optional()
});

export type CreateTimelineInput = z.infer<typeof CreateTimelineSchema>;
export type UpdateTimelineInput = z.infer<typeof UpdateTimelineSchema>;
export type InteractTimelineInput = z.infer<typeof InteractTimelineSchema>;
export type GoBackInput = z.infer<typeof GoBackSchema>;
