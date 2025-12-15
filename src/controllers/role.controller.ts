import { Request, Response } from "express";
import * as roleService from "../services/role.service";

export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { roleId, name, description, permissions, insertAfter } = req.body;

        if (!roleId || !name) {
            res.status(400).json({
                success: false,
                error: "roleId and name are required"
            });
            return;
        }

        const role = await roleService.createRole({
            roleId,
            name,
            description,
            permissions,
            insertAfter
        });

        res.status(201).json({
            success: true,
            data: role
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function getAll(req: Request, res: Response): Promise<void> {
    try {
        const roles = await roleService.getAllRoles();

        res.json({
            success: true,
            data: roles,
            count: roles.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function getById(req: Request, res: Response): Promise<void> {
    try {
        const { roleId } = req.params;
        const role = await roleService.getRoleById(roleId);

        if (!role) {
            res.status(404).json({
                success: false,
                error: `Role ${roleId} not found`
            });
            return;
        }

        res.json({
            success: true,
            data: role
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    try {
        const { roleId } = req.params;
        const { name, description, permissions } = req.body;

        const role = await roleService.updateRole(roleId, {
            name,
            description,
            permissions
        });

        if (!role) {
            res.status(404).json({
                success: false,
                error: `Role ${roleId} not found`
            });
            return;
        }

        res.json({
            success: true,
            data: role
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
    try {
        const { roleId } = req.params;
        await roleService.deleteRole(roleId);

        res.json({
            success: true,
            message: `Role ${roleId} deleted`
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function reorder(req: Request, res: Response): Promise<void> {
    try {
        const { roleOrder } = req.body;

        if (!Array.isArray(roleOrder)) {
            res.status(400).json({
                success: false,
                error: "roleOrder must be an array"
            });
            return;
        }

        const newOrder = await roleService.reorderRoles(roleOrder);

        res.json({
            success: true,
            data: { roleOrder: newOrder }
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function getAgents(req: Request, res: Response): Promise<void> {
    try {
        const { roleId } = req.params;

        const role = await roleService.getRoleById(roleId);
        if (!role) {
            res.status(404).json({
                success: false,
                error: `Role ${roleId} not found`
            });
            return;
        }

        const agents = await roleService.getAgentsByRole(roleId);

        res.json({
            success: true,
            data: agents,
            count: agents.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function getAssignments(req: Request, res: Response): Promise<void> {
    try {
        const assignments = await roleService.getRoleAssignments();

        res.json({
            success: true,
            data: assignments,
            count: assignments.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function addAssignment(req: Request, res: Response): Promise<void> {
    try {
        const { roleId, note } = req.body;
        const bungieId = req.resolvedAgent?.bungieId || req.body.bungieId;

        if (!bungieId || !roleId) {
            res.status(400).json({
                success: false,
                error: "bungieId and roleId are required"
            });
            return;
        }

        const assignment = await roleService.addRoleAssignment(bungieId, roleId, note);

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function removeAssignment(req: Request, res: Response): Promise<void> {
    try {
        const bungieId = req.resolvedAgent?.bungieId || req.params.bungieId;
        const deleted = await roleService.removeRoleAssignment(bungieId);

        if (!deleted) {
            res.status(404).json({
                success: false,
                error: `Aucune attribution pour le Bungie ID ${bungieId}`
            });
            return;
        }

        res.json({
            success: true,
            message: `Attribution pour ${bungieId} supprimée`
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
