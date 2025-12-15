import { z } from 'zod';
import { PaginationSchema } from './common.schema';

export const AnnouncementPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const AnnouncementStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const AnnouncementVisibilityEnum = z.enum(['ALL', 'AGENT', 'ECHO', 'ORACLE', 'ARCHITECT', 'FOUNDER', 'EMISSARY', 'GROUP']);

export const CreateAnnouncementSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters'),

    content: z.string()
        .min(1, 'Content is required')
        .max(5000, 'Content must be at most 5000 characters'),

    priority: AnnouncementPriorityEnum
        .optional()
        .default('MEDIUM'),

    status: AnnouncementStatusEnum
        .optional()
        .default('PUBLISHED'),

    visibility: AnnouncementVisibilityEnum
        .optional()
        .default('ALL'),

    targetGroup: z.string()
        .max(100, 'Target group too long')
        .optional(),

    tags: z.array(z.string().max(50))
        .max(10, 'Maximum 10 tags')
        .optional()
        .default([]),

    expiresAt: z.string()
        .datetime({ message: 'Invalid date format' })
        .optional()
});

export const UpdateAnnouncementSchema = z.object({
    title: z.string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must be at most 200 characters')
        .optional(),

    content: z.string()
        .min(1, 'Content cannot be empty')
        .max(5000, 'Content must be at most 5000 characters')
        .optional(),

    priority: AnnouncementPriorityEnum.optional(),
    status: AnnouncementStatusEnum.optional(),
    visibility: AnnouncementVisibilityEnum.optional(),

    targetGroup: z.string()
        .max(100, 'Target group too long')
        .optional(),

    tags: z.array(z.string().max(50))
        .max(10, 'Maximum 10 tags')
        .optional(),

    expiresAt: z.string()
        .datetime({ message: 'Invalid date format' })
        .optional()
});

export const GetAnnouncementsQuerySchema = PaginationSchema.extend({
    priority: AnnouncementPriorityEnum.optional(),
    status: AnnouncementStatusEnum.optional(),
    visibility: AnnouncementVisibilityEnum.optional()
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementSchema>;
export type GetAnnouncementsQuery = z.infer<typeof GetAnnouncementsQuerySchema>;
