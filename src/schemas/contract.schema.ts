import { z } from 'zod';

export const EmblemInputSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be at most 100 characters long'),
    code: z.string()
        .min(1, 'Code is required')
        .max(15, 'Code is too long')
        .regex(/^[A-Z0-9-]+$/i, 'Invalid code format (letters, numbers, hyphens)')
        .refine(
            (code) => code.replace(/-/g, '').length <= 9,
            { message: 'Code must have max 9 characters (without dashes)' }
        )
});

export const ContributorSchema = z.object({
    bungieId: z.string().min(1, 'Bungie ID is required'),
    displayName: z.string()
        .min(1, 'Display name is required')
        .max(100, 'Display name is too long'),
    isAnonymous: z.boolean().optional().default(false)
});

export const MediaSchema = z.object({
    url: z.string().url('Invalid URL'),
    legend: z.string().max(200, 'Legend is too long').optional()
});

export const CreateContractSchema = z.object({
    emblems: z.array(EmblemInputSchema)
        .min(1, 'At least one emblem is required')
        .max(100, 'Maximum 100 emblems per contract'),

    contributors: z.array(ContributorSchema)
        .min(1, 'At least one contributor is required'),

    validationDeadline: z.string()
        .datetime({ message: 'Invalid date format' })
        .optional(),

    validationPeriod: z.union([z.literal(7), z.literal(14)])
        .optional()
        .default(14),

    media: z.array(MediaSchema).optional().default([])
});

export const UpdateContractSchema = z.object({
    status: z.enum(['PENDING', 'VALIDATED', 'CANCELLED', 'REVOKED', 'PARTIAL']).optional(),
    validationDeadline: z.string().datetime().nullable().optional(),
    isExpired: z.boolean().optional(),
    isSigned: z.boolean().optional()
});

export const PartialValidationSchema = z.object({
    decisions: z.array(z.object({
        emblemId: z.string().min(1, 'ID emblem required'),
        accepted: z.boolean()
    })).min(1, 'At least one decision required')
});

export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;
export type PartialValidationInput = z.infer<typeof PartialValidationSchema>;

export function validateSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string; details: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const details = result.error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
    });

    return {
        success: false,
        error: 'Validation failed',
        details
    };
}
