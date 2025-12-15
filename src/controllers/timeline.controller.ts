import { Request, Response } from "express";
import { timelineService } from "../services/timeline.service";
import { generateUniqueId } from "../utils/generate";

export const createTimeline = async (req: Request, res: Response) => {
    try {
        const timelineData = req.body;

        if (!timelineData.name) {
            return res.status(400).json({
                success: false,
                message: "Timeline name is required"
            });
        }

        if (!timelineData.timelineId) {
            timelineData.timelineId = generateUniqueId('TL');
        }

        const result = await timelineService.createTimeline(timelineData);

        return res.status(201).json({
            success: true,
            message: "Timeline created successfully",
            timeline: result.timeline
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error creating timeline",
            error: error.message
        });
    }
};

export const getTimelineById = async (req: Request, res: Response) => {
    try {
        const { timelineId } = req.params;
        const agentId = (req as any).user?.agentId;

        if (!timelineId) {
            return res.status(400).json({
                success: false,
                message: "timelineId is required"
            });
        }

        if (!agentId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const result = await timelineService.getAgentTimelineProgress(agentId, timelineId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error getting timeline",
            error: error.message
        });
    }
};

export const getAllTimelines = async (req: Request, res: Response) => {
    try {
        const result = await timelineService.getAllTimelines();

        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error getting timelines",
            error: error.message
        });
    }
};

export const updateTimeline = async (req: Request, res: Response) => {
    try {
        const { timelineId } = req.params;
        const updateData = req.body;

        if (!timelineId) {
            return res.status(400).json({
                success: false,
                message: "timelineId is required"
            });
        }

        const result = await timelineService.updateTimeline(timelineId, updateData);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            success: true,
            message: "Timeline updated successfully",
            timeline: result.timeline
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error updating timeline",
            error: error.message
        });
    }
};

export const deleteTimeline = async (req: Request, res: Response) => {
    try {
        const { timelineId } = req.params;

        if (!timelineId) {
            return res.status(400).json({
                success: false,
                message: "timelineId is required"
            });
        }

        const result = await timelineService.deleteTimeline(timelineId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error deleting timeline",
            error: error.message
        });
    }
};

export const getAvailableTimelines = async (req: Request, res: Response) => {
    try {
        const result = await timelineService.getAvailableTimelines();

        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error getting available timelines",
            error: error.message
        });
    }
};

export const goHome = async (req: Request, res: Response) => {
    try {
        const agentId = (req as any).user?.agentId;
        if (!agentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await timelineService.goHome(agentId);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Error", error: error.message });
    }
};

export const goBack = async (req: Request, res: Response) => {
    try {
        const agentId = (req as any).user?.agentId;
        const { timelineId, entryId } = req.body;

        if (!agentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await timelineService.goBack(agentId, { timelineId, entryId });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Error", error: error.message });
    }
};

export const interact = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.agentId;
        if (!agentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { input, context } = req.body;
        if (!input) return res.status(400).json({ success: false, message: "Input is required" });

        const result = await timelineService.processInteraction(agentId, String(input), context || {});

        return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Error", error: error.message });
    }
};
