import { Role } from "../models/role.model";
import { Settings, getSettings, IRoleAssignment } from "../models/settings.model";
import { Agent } from "../models/agent.model";
import { logger } from "../utils";
import { IRoleDocument } from "../types/role";

interface CreateRoleInput {
    roleId: string;
    name: string;
    description?: string;
    permissions?: string[];
    insertAfter?: string;
}

interface UpdateRoleInput {
    name?: string;
    description?: string;
    permissions?: string[];
}


export async function createRole(data: CreateRoleInput): Promise<IRoleDocument> {
    const existing = await Role.findOne({ roleId: data.roleId.toUpperCase() });
    if (existing) {
        throw new Error(`Le rôle ${data.roleId} existe déjà`);
    }

    const role = await Role.create({
        roleId: data.roleId.toUpperCase(),
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
        isSystem: false
    });

    const settings = await getSettings();

    if (data.insertAfter) {
        const insertIndex = settings.roleOrder.indexOf(data.insertAfter.toUpperCase());
        if (insertIndex === -1) {
            const agentIndex = settings.roleOrder.indexOf("AGENT");
            if (agentIndex !== -1) {
                settings.roleOrder.splice(agentIndex, 0, role.roleId);
            } else {
                settings.roleOrder.push(role.roleId);
            }
        } else {
            settings.roleOrder.splice(insertIndex + 1, 0, role.roleId);
        }
    } else {
        const agentIndex = settings.roleOrder.indexOf("AGENT");
        if (agentIndex !== -1) {
            settings.roleOrder.splice(agentIndex, 0, role.roleId);
        } else {
            settings.roleOrder.push(role.roleId);
        }
    }

    await settings.save();

    return role;
}

export async function getAllRoles(): Promise<IRoleDocument[]> {
    const settings = await getSettings();
    const roles = await Role.find();

    return roles.sort((a, b) => {
        const indexA = settings.roleOrder.indexOf(a.roleId);
        const indexB = settings.roleOrder.indexOf(b.roleId);
        const safeIndexA = indexA === -1 ? 999 : indexA;
        const safeIndexB = indexB === -1 ? 999 : indexB;
        return safeIndexA - safeIndexB;
    });
}

export async function getRoleById(roleId: string): Promise<IRoleDocument | null> {
    return Role.findOne({ roleId: roleId.toUpperCase() });
}

export async function updateRole(roleId: string, data: UpdateRoleInput): Promise<IRoleDocument | null> {
    const role = await Role.findOne({ roleId: roleId.toUpperCase() });

    if (!role) {
        return null;
    }

    if (role.isSystem && data.name) {
    }

    if (data.name !== undefined) role.name = data.name;
    if (data.description !== undefined) role.description = data.description;
    if (data.permissions !== undefined && !role.isSystem) {
        role.permissions = data.permissions;
    }

    await role.save();
    return role;
}

export async function deleteRole(roleId: string): Promise<boolean> {
    const role = await Role.findOne({ roleId: roleId.toUpperCase() });

    if (!role) {
        throw new Error(`RRole ${roleId} not found`);
    }

    if (role.isSystem) {
        throw new Error(`System role ${roleId} cannot be deleted`);
    }

    const agentsWithRole = await Agent.countDocuments({ 'protocol.roles': roleId.toUpperCase() });
    if (agentsWithRole > 0) {
        throw new Error(`Cannot delete: ${agentsWithRole} agent(s) have this role`);
    }

    const settings = await getSettings();
    settings.roleOrder = settings.roleOrder.filter(r => r !== roleId.toUpperCase());
    await settings.save();

    await Role.deleteOne({ _id: role._id });

    return true;
}

export async function reorderRoles(newOrder: string[]): Promise<string[]> {
    const settings = await getSettings();

    const existingRoles = await Role.find().select('roleId');
    const existingIds = existingRoles.map(r => r.roleId);

    for (const roleId of newOrder) {
        if (!existingIds.includes(roleId.toUpperCase())) {
            throw new Error(`RRole ${roleId} not found`);
        }
    }

    settings.roleOrder = newOrder.map(r => r.toUpperCase());
    await settings.save();

    return settings.roleOrder;
}

export async function getAgentsByRole(roleId: string): Promise<any[]> {
    return Agent.find({ 'protocol.roles': roleId.toUpperCase() })
        .select('bungieId displayName protocol.roles protocol.agentNumber createdAt');
}

export async function getRoleRank(roleId: string): Promise<number> {
    const settings = await getSettings();
    const index = settings.roleOrder.indexOf(roleId.toUpperCase());
    return index === -1 ? 999 : index;
}

export async function isRoleHigher(roleId1: string, roleId2: string): Promise<boolean> {
    const rank1 = await getRoleRank(roleId1);
    const rank2 = await getRoleRank(roleId2);
    return rank1 < rank2;
}

export async function getRoleAssignments(): Promise<IRoleAssignment[]> {
    const settings = await getSettings();
    return settings.roleAssignments || [];
}

export async function addRoleAssignment(bungieId: string, roleId: string, note?: string): Promise<IRoleAssignment> {
    const settings = await getSettings();

    const role = await Role.findOne({ roleId: roleId.toUpperCase() });
    if (!role) {
        throw new Error(`RRole ${roleId} not found`);
    }

    const existingIndex = settings.roleAssignments.findIndex(a => a.bungieId === bungieId);
    if (existingIndex !== -1) {
        settings.roleAssignments[existingIndex] = {
            bungieId,
            roleId: roleId.toUpperCase(),
            note
        };
    } else {
        settings.roleAssignments.push({
            bungieId,
            roleId: roleId.toUpperCase(),
            note
        });
    }

    await settings.save();

    return { bungieId, roleId: roleId.toUpperCase(), note };
}

export async function removeRoleAssignment(bungieId: string): Promise<boolean> {
    const settings = await getSettings();

    const initialLength = settings.roleAssignments.length;
    settings.roleAssignments = settings.roleAssignments.filter(a => a.bungieId !== bungieId);

    if (settings.roleAssignments.length === initialLength) {
        return false;
    }

    await settings.save();
    return true;
}

export async function getRoleAssignmentForBungieId(bungieId: string): Promise<IRoleAssignment | undefined> {
    const settings = await getSettings();
    return settings.roleAssignments.find(a => a.bungieId === bungieId);
}

const SYSTEM_ROLES = [
    { roleId: 'FOUNDER', name: 'role.founder.title', description: 'role.founder.description', color: '#3A4BD1', permissions: [], isSystem: true },
    { roleId: 'ARCHITECT', name: 'role.architect.title', description: 'role.architect.description', color: '#DAC762', permissions: [], isSystem: true },
    { roleId: 'ORACLE', name: 'role.oracle.title', description: 'role.oracle.description', color: '#62DAAC', permissions: [], isSystem: true },
    { roleId: 'ECHO', name: 'role.echo.title', description: 'role.echo.description', color: '#DAB062', permissions: [], isSystem: true },
    { roleId: 'EMISSARY', name: 'role.emissary.title', description: 'role.emissary.description', color: '#DA629E', permissions: [], isSystem: true },
    { roleId: 'AGENT', name: 'role.agent.title', description: 'role.agent.description', color: '#C0C0C0', permissions: [], isSystem: true },
];

export async function seedSystemRoles(): Promise<void> {
    try {
        let created = 0;
        let updated = 0;

        for (const roleData of SYSTEM_ROLES) {
            const existing = await Role.findOne({ roleId: roleData.roleId });
            if (!existing) {
                await Role.create({
                    roleId: roleData.roleId,
                    name: roleData.name,
                    description: roleData.description,
                    color: roleData.color,
                    permissions: [],
                    isSystem: true
                });
                created++;
                logger.info(`System role created: ${roleData.roleId}`);
            } else {
                const needsUpdate =
                    existing.name !== roleData.name ||
                    existing.description !== roleData.description ||
                    existing.color !== roleData.color;

                if (needsUpdate) {
                    await Role.updateOne(
                        { roleId: roleData.roleId },
                        {
                            $set: {
                                name: roleData.name,
                                description: roleData.description,
                                color: roleData.color
                            }
                        }
                    );
                    updated++;
                    logger.info(`System role updated: ${roleData.roleId}`);
                }
            }
        }

        const settings = await getSettings();

        let orderUpdated = false;
        for (const roleData of SYSTEM_ROLES) {
            if (!settings.roleOrder.includes(roleData.roleId)) {
                const defaultOrder = SYSTEM_ROLES.map(r => r.roleId);
                const insertIndex = defaultOrder.indexOf(roleData.roleId);
                settings.roleOrder.splice(insertIndex, 0, roleData.roleId);
                orderUpdated = true;
            }
        }

        if (orderUpdated) {
            await settings.save();
            logger.info('roleOrder updated');
        }

        if (created > 0 || updated > 0) {
            logger.info(`🎭 System roles: ${created} created, ${updated} updated`);
        } else {
            logger.info('System roles already up to date');
        }
    } catch (error: any) {
        logger.error('Error seeding system roles', error.message);
        throw error;
    }
}

