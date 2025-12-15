import { z } from 'zod';

export const CreateDivisionSchema = z.object({
    divisionId: z.string()
        .max(50, 'Division ID too long')
        .regex(/^[A-Z0-9_-]+$/i, 'Invalid division ID format')
        .optional(),

    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long'),

    description: z.string()
        .max(500, 'Description too long')
        .optional(),

    color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
        .optional(),

    icon: z.string()
        .max(50, 'Icon name too long')
        .optional()
});

export const UpdateDivisionSchema = z.object({
    name: z.string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name too long')
        .optional(),

    description: z.string()
        .max(500, 'Description too long')
        .optional(),

    color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
        .optional(),

    icon: z.string()
        .max(50, 'Icon name too long')
        .optional()
});

export const SetLeaderSchema = z.object({
    leaderId: z.string().min(1, 'Leader ID is required')
});

export const AddMemberSchema = z.object({
    identifier: z.string().min(1, 'Identifier (bungieId or uniqueName) is required')
});

export const DivisionRequestSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long'),

    description: z.string()
        .max(500, 'Description too long')
        .optional(),

    color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
        .optional(),

    icon: z.string()
        .max(50, 'Icon name too long')
        .optional()
});

export const RejectRequestSchema = z.object({
    reason: z.string().max(500, 'Reason too long').optional()
});

export type CreateDivisionInput = z.infer<typeof CreateDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof UpdateDivisionSchema>;
export type SetLeaderInput = z.infer<typeof SetLeaderSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type DivisionRequestInput = z.infer<typeof DivisionRequestSchema>;
export type RejectRequestInput = z.infer<typeof RejectRequestSchema>;

