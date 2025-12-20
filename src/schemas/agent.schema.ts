import { z } from 'zod';

export const SpeciesEnum = z.enum(['HUMAN', 'EXO', 'AWOKEN']);
export const ThemeIdEnum = z.enum(['protocol', 'clovisBray', 'vanguard', 'blackArmory', 'opulence']);
export const RoleEnum = z.enum(['AGENT', 'ECHO', 'ORACLE', 'ARCHITECT', 'FOUNDER', 'EMISSARY']);

const SettingsSchema = z.object({
    notifications: z.boolean().optional(),
    publicProfile: z.boolean().optional(),
    activeTheme: ThemeIdEnum.optional(),
    soundEffects: z.boolean().optional(),
    language: z.string().max(10, 'Language code too long').optional()
}).optional();

export const UpdateAgentProfileSchema = z.object({
    protocol: z.object({
        customName: z.string()
            .max(50, 'Custom name cannot exceed 50 characters')
            .nullable()
            .optional(),
        bio: z.string()
            .max(500, 'Bio cannot exceed 500 characters')
            .nullable()
            .optional(),
        species: SpeciesEnum.optional(),
        hasSeenRecruitment: z.boolean().optional(),
        settings: SettingsSchema
    }).optional()
});

export const FounderUpdateAgentSchema = z.object({
    protocol: z.object({
        agentName: z.string()
            .min(1, 'Agent name cannot be empty')
            .max(50, 'Agent name cannot exceed 50 characters')
            .optional(),
        customName: z.string()
            .max(50, 'Custom name cannot exceed 50 characters')
            .nullable()
            .optional(),
        species: SpeciesEnum.optional(),
        role: RoleEnum.optional(),
        clearanceLevel: z.number()
            .int()
            .min(0, 'Clearance must be at least 0')
            .max(10, 'Clearance cannot exceed 10')
            .optional(),
        hasSeenRecruitment: z.boolean().optional(),
        protocolJoinedAt: z.string().datetime().optional(),
        division: z.string().optional(),
        settings: SettingsSchema
    }).optional()
});

export const PromoteDemoteSchema = z.object({
    roleId: z.string().min(1, 'roleId is required')
});

export const DeactivateAgentSchema = z.object({
    reason: z.string().max(500, 'Reason too long').optional()
});

export const DeleteAgentSchema = z.object({
    confirm: z.boolean().optional()
});

export type UpdateAgentProfileInput = z.infer<typeof UpdateAgentProfileSchema>;
export type FounderUpdateAgentInput = z.infer<typeof FounderUpdateAgentSchema>;
export type PromoteDemoteInput = z.infer<typeof PromoteDemoteSchema>;
export type DeactivateAgentInput = z.infer<typeof DeactivateAgentSchema>;
export type DeleteAgentInput = z.infer<typeof DeleteAgentSchema>;
