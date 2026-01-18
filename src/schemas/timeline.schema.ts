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

// Base entry schema (without subEntries to avoid circular reference)
const BaseEntrySchema = z.object({
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

// Entry schema with subEntries (recursive)
type EntryInput = z.infer<typeof BaseEntrySchema> & {
    subEntries?: EntryInput[];
};

const EntrySchema: z.ZodType<EntryInput> = BaseEntrySchema.extend({
    subEntries: z.lazy(() => z.array(EntrySchema)).optional()
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

const SecurityProtocolSchema = z.object({
    clearanceLevel: z.enum(['1', '2', '3', '4', '5']).optional().default('1'),
    accessMode: z.enum(['PUBLIC', 'RESTRICTED', 'CLASSIFIED']).optional().default('PUBLIC'),
    accessCode: z.string().min(1, 'Access code is required'),
    requiresAuth: z.boolean().optional().default(false),
    requires2FA: z.boolean().optional().default(false),
    whiteList: z.array(z.string()).optional(),
    blackList: z.array(z.string()).optional(),
    autoLockOnBreach: z.boolean().optional().default(false),
    maxAttempts: z.number().int().optional().default(3),
    lockDuration: z.number().int().optional().default(60)
}).optional();

const MetadataSchema = z.object({
    createdBy: z.string().optional(),
    collaborators: z.array(z.string()).optional(),
    ownerTeam: z.string().optional(),
    version: z.string().optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
    isVerified: z.boolean().optional(),
    validatedBy: z.string().optional(),
    updatedBy: z.string().optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.string().optional(),
    estimatedTime: z.number().optional()
}).optional();

const ExternalRefsSchema = z.object({
    images: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
    links: z.array(z.string()).optional()
}).optional();

const LoreLockRulesSchema = z.object({
    loreRefs: z.array(z.string()).optional(),
    loreUnlocked: z.array(z.string()).optional(),
    loreLockRules: z.array(z.string()).optional()
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

    rewards: TimelineRewardSchema,

    securityProtocol: SecurityProtocolSchema,

    metadata: MetadataSchema,

    externalRefs: ExternalRefsSchema,

    loreLockRules: LoreLockRulesSchema
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
    rewards: TimelineRewardSchema,
    securityProtocol: SecurityProtocolSchema,
    metadata: MetadataSchema,
    externalRefs: ExternalRefsSchema,
    loreLockRules: LoreLockRulesSchema
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
