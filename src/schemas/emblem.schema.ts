import { z } from 'zod';
import { PaginationSchema } from './common.schema';

const EmblemCodePattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export const EmblemStatusEnum = z.enum(['AVAILABLE', 'UNAVAILABLE', 'REVOKED', 'REJECTED']);
export const EmblemRarityEnum = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY', 'EXOTIC']);

export const CreateEmblemSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters'),

    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),

    image: z.string().url('Image must be a valid URL').optional(),

    code: z.string()
        .regex(EmblemCodePattern, 'Code must be in format XXX-XXX-XXX (uppercase letters or digits)')
        .optional(),

    rarity: EmblemRarityEnum.optional().default('COMMON'),

    status: EmblemStatusEnum
});

export const UpdateEmblemSchema = z.object({
    name: z.string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name cannot exceed 100 characters')
        .optional(),

    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),

    image: z.string().url('Image must be a valid URL').optional(),

    code: z.string()
        .regex(EmblemCodePattern, 'Code must be in format XXX-XXX-XXX (uppercase letters or digits)')
        .optional(),

    rarity: EmblemRarityEnum.optional(),

    status: EmblemStatusEnum.optional()
});

export const GetEmblemsQuerySchema = PaginationSchema.extend({
    status: EmblemStatusEnum.optional(),
    rarity: EmblemRarityEnum.optional()
});

export type CreateEmblemInput = z.infer<typeof CreateEmblemSchema>;
export type UpdateEmblemInput = z.infer<typeof UpdateEmblemSchema>;
export type GetEmblemsQuery = z.infer<typeof GetEmblemsQuerySchema>;

