import { Division, IDivision } from "../models/division.model";
import { Agent } from "../models/agent.model";
import { logger } from "../utils";
import { generateUniqueId } from "../utils/generate";

interface CreateDivisionInput {
    divisionId?: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

interface UpdateDivisionInput {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
}

export async function createDivision(data: CreateDivisionInput): Promise<IDivision> {
    const divisionId = data.divisionId?.toUpperCase() || generateUniqueId('DIV');

    const existing = await Division.findOne({ divisionId });
    if (existing) {
        throw new Error(`The division ${divisionId} already exists`);
    }

    const division = await Division.create({
        divisionId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isSystem: false
    });

    return division;
}

export async function getAllDivisions(): Promise<IDivision[]> {
    return Division.find().sort({ divisionId: 1 });
}

export async function getDivisionById(divisionId: string): Promise<IDivision | null> {
    return Division.findOne({ divisionId: divisionId.toUpperCase() });
}

export async function getAgentByBungieId(bungieId: string): Promise<any> {
    return Agent.findOne({ bungieId });
}

export async function updateDivision(divisionId: string, data: UpdateDivisionInput): Promise<IDivision | null> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });

    if (!division) {
        return null;
    }

    if (data.name !== undefined) division.name = data.name;
    if (data.description !== undefined) division.description = data.description;
    if (data.color !== undefined) division.color = data.color;
    if (data.icon !== undefined) division.icon = data.icon;

    await division.save();
    return division;
}

export async function deleteDivision(divisionId: string): Promise<boolean> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });

    if (!division) {
        throw new Error(`Division ${divisionId} not found`);
    }

    if (division.isSystem) {
        throw new Error(`System division ${divisionId} cannot be deleted`);
    }

    const agentsInDivision = await Agent.countDocuments({ 'protocol.division': divisionId.toUpperCase() });
    if (agentsInDivision > 0) {
        throw new Error(`Cannot delete: ${agentsInDivision} agent(s) are in this division`);
    }

    await Division.deleteOne({ _id: division._id });
    return true;
}

export async function getAgentsByDivision(divisionId: string): Promise<any[]> {
    return Agent.find({ 'protocol.division': divisionId.toUpperCase() })
        .select('bungieId bungieUser.uniqueName bungieUser.displayName protocol.roles protocol.division protocol.agentName createdAt');
}

export async function getMemberCount(divisionId: string): Promise<number> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });
    if (!division) return 0;

    const count = await Agent.countDocuments({
        'protocol.division': divisionId.toUpperCase(),
        bungieId: { $ne: division.leaderId }
    });
    return count;
}

export async function setLeader(divisionId: string, leaderBungieId: string): Promise<IDivision | null> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });
    if (!division) {
        throw new Error(`Division ${divisionId} not found`);
    }

    const agent = await Agent.findOne({ bungieId: leaderBungieId });
    if (!agent) {
        throw new Error(`Agent with bungieId ${leaderBungieId} not found`);
    }

    division.leaderId = leaderBungieId;
    await division.save();

    await Agent.findByIdAndUpdate(agent._id, {
        'protocol.division': divisionId.toUpperCase()
    });

    return division;
}

export async function addMember(divisionId: string, identifier: string): Promise<any> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });
    if (!division) {
        throw new Error(`Division ${divisionId} introuvable`);
    }

    let agent = await Agent.findOne({ bungieId: identifier });
    if (!agent) {
        agent = await Agent.findOne({ 'bungieUser.uniqueName': identifier });
    }
    if (!agent) {
        throw new Error(`Agent ${identifier} introuvable`);
    }

    const currentDivision = agent.protocol?.division;
    if (currentDivision && currentDivision !== 'PROTOCOL' && currentDivision !== divisionId.toUpperCase()) {
        throw new Error(`Agent already member of division ${currentDivision}`);
    }

    await Agent.findByIdAndUpdate(agent._id, {
        'protocol.division': divisionId.toUpperCase()
    });

    return {
        bungieId: agent.bungieId,
        agentName: agent.protocol?.agentName,
        division: divisionId.toUpperCase()
    };
}

export async function removeMember(divisionId: string, identifier: string): Promise<any> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });
    if (!division) {
        throw new Error(`Division ${divisionId} not found`);
    }

    let agent = await Agent.findOne({ bungieId: identifier });
    if (!agent) {
        agent = await Agent.findOne({ 'bungieUser.uniqueName': identifier });
    }
    if (!agent) {
        throw new Error(`Agent ${identifier} not found`);
    }

    if (agent.protocol?.division !== divisionId.toUpperCase()) {
        throw new Error(`Agent is not a member of this division`);
    }

    if (agent.bungieId === division.leaderId) {
        throw new Error(`Cannot remove the leader. Use the leave endpoint.`);
    }

    await Agent.findByIdAndUpdate(agent._id, {
        'protocol.division': 'PROTOCOL'
    });

    return {
        bungieId: agent.bungieId,
        agentName: agent.protocol?.agentName,
        previousDivision: divisionId.toUpperCase(),
        newDivision: 'PROTOCOL'
    };
}

export async function leaderLeave(divisionId: string, leaderBungieId: string): Promise<{ deleted: boolean }> {
    const division = await Division.findOne({ divisionId: divisionId.toUpperCase() });
    if (!division) {
        throw new Error(`Division ${divisionId} not found`);
    }

    if (division.isSystem) {
        throw new Error(`Cannot leave a system division`);
    }

    if (division.leaderId !== leaderBungieId) {
        throw new Error(`You are not the leader of this division`);
    }

    const memberCount = await getMemberCount(divisionId);

    if (memberCount > 0) {
        throw new Error(`Cannot leave: ${memberCount} member(s) in the division. Remove them first.`);
    }

    await Agent.updateOne(
        { bungieId: leaderBungieId },
        { 'protocol.division': 'PROTOCOL' }
    );

    await Division.deleteOne({ _id: division._id });

    return { deleted: true };
}

const SYSTEM_DIVISIONS = [
    { divisionId: 'PROTOCOL', name: 'Protocol', description: 'division.protocol.description', color: '#626FDA', icon: 'shield', isSystem: true },
    { divisionId: 'AURORA', name: 'Aurora', description: 'division.aurora.description', color: '#EA3E5A', icon: 'sunrise', isSystem: true },
    { divisionId: 'ZENITH', name: 'Zénith', description: 'division.zenith.description', color: '#7B1CB0', icon: 'zap', isSystem: true },
];

export async function seedSystemDivisions(): Promise<void> {
    try {
        let created = 0;
        let updated = 0;

        for (const divData of SYSTEM_DIVISIONS) {
            const existing = await Division.findOne({ divisionId: divData.divisionId });
            if (!existing) {
                await Division.create({
                    divisionId: divData.divisionId,
                    name: divData.name,
                    description: divData.description,
                    color: divData.color,
                    icon: divData.icon,
                    isSystem: true
                });
                created++;
                logger.info(`System division created: ${divData.divisionId}`);
            } else {
                const needsUpdate =
                    existing.name !== divData.name ||
                    existing.description !== divData.description ||
                    existing.color !== divData.color ||
                    existing.icon !== divData.icon;

                if (needsUpdate) {
                    await Division.updateOne(
                        { divisionId: divData.divisionId },
                        {
                            $set: {
                                name: divData.name,
                                description: divData.description,
                                color: divData.color,
                                icon: divData.icon
                            }
                        }
                    );
                    updated++;
                    logger.info(`System division updated: ${divData.divisionId}`);
                }
            }
        }

        if (created > 0 || updated > 0) {
            logger.info(`🏛️ System divisions: ${created} created, ${updated} updated`);
        } else {
            logger.info('System divisions already up to date');
        }
    } catch (error: any) {
        logger.error('Error seeding system divisions:', error.message);
        throw error;
    }
}
