import { Request, Response } from 'express';
import * as divisionService from '../services/division.service';

export async function getMyDivision(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user;

        if (!user?.bungieId) {
            res.status(401).json({
                success: false,
                error: "Agent not authenticated"
            });
            return;
        }

        const agent = await divisionService.getAgentByBungieId(user.bungieId);

        if (!agent) {
            res.status(404).json({
                success: false,
                error: "Agent not found"
            });
            return;
        }

        const divisionId = agent.protocol?.division || 'PROTOCOL';
        const division = await divisionService.getDivisionById(divisionId);

        if (!division) {
            res.json({
                success: true,
                data: {
                    divisionId: divisionId,
                    name: divisionId,
                    description: null,
                    isSystem: true,
                    isLeader: false,
                    memberCount: 0,
                    members: []
                },
                message: "Default division (not configured)"
            });
            return;
        }

        const memberCount = await divisionService.getMemberCount(divisionId);
        const isLeader = division.leaderId === agent.bungieId;

        const members = await divisionService.getAgentsByDivision(divisionId);
        const memberList = members.map((m: any) => ({
            bungieId: m.bungieId,
            uniqueName: m.protocol?.agentName || m.bungieGlobalDisplayName,
            customName: m.protocol?.customName || null,
            joinedAt: m.protocol?.protocolJoinedAt
        }));

        res.json({
            success: true,
            data: {
                ...division.toObject(),
                memberCount,
                isLeader,
                members: memberList
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function create(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId, name, description, color, icon } = req.body;

        const division = await divisionService.createDivision({
            divisionId,
            name,
            description,
            color,
            icon
        });

        res.status(201).json({
            success: true,
            data: division
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
        const divisions = await divisionService.getAllDivisions();

        res.json({
            success: true,
            data: divisions
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
        const { divisionId } = req.params;
        const division = await divisionService.getDivisionById(divisionId);

        if (!division) {
            res.status(404).json({
                success: false,
                error: `Division ${divisionId} not found`
            });
            return;
        }

        res.json({
            success: true,
            data: division
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
        const { divisionId } = req.params;
        const { name, description, color, icon } = req.body;

        const division = await divisionService.updateDivision(divisionId, {
            name,
            description,
            color,
            icon
        });

        if (!division) {
            res.status(404).json({
                success: false,
                error: `Division ${divisionId} not found`
            });
            return;
        }

        res.json({
            success: true,
            data: division
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function deleteDivision(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId } = req.params;
        await divisionService.deleteDivision(divisionId);

        res.json({
            success: true,
            message: `Division ${divisionId} deleted`
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
        const { divisionId } = req.params;
        const agents = await divisionService.getAgentsByDivision(divisionId);

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

export async function setLeader(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId } = req.params;
        const agent = req.resolvedAgent!;

        const division = await divisionService.setLeader(divisionId, agent._id!.toString());

        res.json({
            success: true,
            data: division,
            message: `Leader set for division ${divisionId}`
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function addMember(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId } = req.params;
        const agent = req.resolvedAgent!;

        const result = await divisionService.addMember(divisionId, agent._id!.toString());

        res.json({
            success: true,
            data: result,
            message: `Agent added to division ${divisionId}`
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId } = req.params;
        const agent = req.resolvedAgent!;

        const result = await divisionService.removeMember(divisionId, agent._id!.toString());

        res.json({
            success: true,
            data: result,
            message: `Agent removed from division ${divisionId}`
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function leaderLeave(req: Request, res: Response): Promise<void> {
    try {
        const { divisionId } = req.params;
        const { leaderId } = req.body;

        if (!leaderId) {
            res.status(400).json({
                success: false,
                error: "leaderId is required"
            });
            return;
        }

        const result = await divisionService.leaderLeave(divisionId, leaderId);

        res.json({
            success: true,
            message: result.deleted
                ? `Division ${divisionId} deleted (empty)`
                : `Leader left division ${divisionId}`,
            deleted: result.deleted
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}
