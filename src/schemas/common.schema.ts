import { z } from 'zod';

export const MongoIdSchema = z.string()
    .length(24, 'Invalid ID')
    .regex(/^[a-f0-9]+$/i, 'Invalid ID format');


export const BungieIdSchema = z.string()
    .min(1, 'Bungie ID required')
    .regex(/^\d+$/, 'Bungie ID must be numeric');

export const CustomIdSchema = z.string()
    .min(1, 'ID required')
    .max(100, 'ID too long');

export const PaginationSchema = z.object({
    page: z.coerce.number()
        .int()
        .min(1)
        .default(1)
        .catch(1),

    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .catch(50)
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const BooleanFilterSchema = z.enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined);

export const DateFilterSchema = z.string()
    .datetime({ message: 'Invalid date format' })
    .optional();

export const ContractIdParamSchema = z.object({
    contractId: CustomIdSchema
});

export const AgentIdParamSchema = z.object({
    agentId: z.string().min(1, 'Agent ID required')
});

export const BadgeIdParamSchema = z.object({
    badgeId: CustomIdSchema
});

export const TimelineIdParamSchema = z.object({
    timelineId: CustomIdSchema
});

export const EmblemIdParamSchema = z.object({
    emblemId: CustomIdSchema
});

export const LoreIdParamSchema = z.object({
    loreId: CustomIdSchema
});

export const DivisionIdParamSchema = z.object({
    divisionId: CustomIdSchema
});

export const RoleIdParamSchema = z.object({
    roleId: CustomIdSchema
});

export const AnnouncementIdParamSchema = z.object({
    id: CustomIdSchema
});

export const RequestIdParamSchema = z.object({
    requestId: CustomIdSchema
});

