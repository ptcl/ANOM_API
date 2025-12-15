import { z } from 'zod';

export const CreateRoleSchema = z.object({
    roleId: z.string()
        .min(1, 'Role ID is required')
        .max(50, 'Role ID cannot exceed 50 characters')
        .regex(/^[A-Z0-9_]+$/i, 'Role ID can only contain letters, numbers, and underscores'),

    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters'),

    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),

    permissions: z.array(z.string()).optional(),

    insertAfter: z.string().optional()
});

export const UpdateRoleSchema = z.object({
    name: z.string()
        .min(1, 'Name cannot be empty')
        .max(100)
        .optional(),

    description: z.string().max(500).optional(),

    permissions: z.array(z.string()).optional()
});

export const ReorderRolesSchema = z.object({
    roleOrder: z.array(z.string())
        .min(1, 'roleOrder must have at least one role')
});

export const AddAssignmentSchema = z.object({
    bungieId: z.string().min(1, 'Bungie ID is required'),
    roleId: z.string().min(1, 'Role ID is required'),
    note: z.string().max(500).optional()
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type ReorderRolesInput = z.infer<typeof ReorderRolesSchema>;
export type AddAssignmentInput = z.infer<typeof AddAssignmentSchema>;
