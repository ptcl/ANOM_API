import { z } from 'zod';
import { PaginationSchema } from './common.schema';

export const LoreCategoryEnum = z.enum(['HISTORY', 'CHARACTER', 'LOCATION', 'EVENT', 'ARTIFACT', 'FACTION', 'TECHNOLOGY', 'OTHER']);
export const LoreStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const LoreVisibilityEnum = z.enum(['PUBLIC', 'AGENTS_ONLY', 'UNLOCKED_ONLY']);

const MAX_TITLE_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 500;
const MAX_PAGE_CONTENT_LENGTH = 50000;
const MAX_PAGES = 100;

const LorePageSchema = z.object({
    pageNumber: z.number().int().positive().optional(),
    title: z.string().max(MAX_TITLE_LENGTH).optional(),
    content: z.string()
        .min(1, 'Page content is required')
        .max(MAX_PAGE_CONTENT_LENGTH, `Content cannot exceed ${MAX_PAGE_CONTENT_LENGTH} characters`)
});

const UnlockConditionsSchema = z.object({
    requiredTimelineIds: z.array(z.string()).optional(),
    requiredEntryIds: z.array(z.string()).optional(),
    requiredLoreIds: z.array(z.string()).optional(),
    requiredFragments: z.number().int().min(0).optional(),
    manualUnlock: z.boolean().optional()
}).optional();

export const CreateLoreSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`),

    summary: z.string()
        .max(MAX_SUMMARY_LENGTH, `Summary cannot exceed ${MAX_SUMMARY_LENGTH} characters`)
        .optional(),

    pages: z.array(LorePageSchema)
        .min(1, 'At least one page is required')
        .max(MAX_PAGES, `Maximum ${MAX_PAGES} pages allowed`),

    category: LoreCategoryEnum.optional().default('OTHER'),

    tags: z.array(z.string().max(50)).max(20).optional(),

    parentLoreId: z.string().optional(),
    relatedLoreIds: z.array(z.string()).optional(),

    isLocked: z.boolean().optional().default(true),
    unlockConditions: UnlockConditionsSchema,

    coverImage: z.string().url('Cover image must be a valid URL').optional(),
    audio: z.string().url('Audio must be a valid URL').optional(),
    externalLinks: z.array(z.string().url()).optional(),

    author: z.string().max(100).optional(),
    status: LoreStatusEnum.optional().default('DRAFT'),
    visibility: LoreVisibilityEnum.optional().default('UNLOCKED_ONLY'),
    order: z.number().int().optional()
});

export const UpdateLoreSchema = z.object({
    title: z.string()
        .min(1, 'Title cannot be empty')
        .max(MAX_TITLE_LENGTH)
        .optional(),

    summary: z.string().max(MAX_SUMMARY_LENGTH).optional(),

    pages: z.array(LorePageSchema).max(MAX_PAGES).optional(),

    category: LoreCategoryEnum.optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),

    parentLoreId: z.string().optional(),
    relatedLoreIds: z.array(z.string()).optional(),

    isLocked: z.boolean().optional(),
    unlockConditions: UnlockConditionsSchema,

    coverImage: z.string().url().optional(),
    audio: z.string().url().optional(),

    status: LoreStatusEnum.optional(),
    visibility: LoreVisibilityEnum.optional(),
    order: z.number().int().optional()
});

export const UnlockLoreSchema = z.object({
    agentId: z.string().min(1, 'Agent ID is required')
});

export const GetLoresQuerySchema = PaginationSchema.extend({
    category: LoreCategoryEnum.optional(),
    status: LoreStatusEnum.optional()
});

export type CreateLoreInput = z.infer<typeof CreateLoreSchema>;
export type UpdateLoreInput = z.infer<typeof UpdateLoreSchema>;
export type UnlockLoreInput = z.infer<typeof UnlockLoreSchema>;
export type GetLoresQuery = z.infer<typeof GetLoresQuerySchema>;
