import { Request, Response } from 'express';
import * as divisionRequestService from '../services/divisionRequest.service';
import { logger } from '../utils';

export async function createRequest(req: Request, res: Response): Promise<void> {
    try {
        const { name, description, color, icon } = req.body;
        const bungieId = req.user?.bungieId;
        const agentName = req.user?.protocol?.agentName;

        if (!bungieId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const request = await divisionRequestService.createRequest(
            { name, description, color, icon },
            bungieId,
            agentName
        );

        res.status(201).json({
            success: true,
            data: request,
            message: 'Division request submitted successfully'
        });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function getMyRequests(req: Request, res: Response): Promise<void> {
    try {
        const bungieId = req.user?.bungieId;

        if (!bungieId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const requests = await divisionRequestService.getMyRequests(bungieId);

        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function cancelRequest(req: Request, res: Response): Promise<void> {
    try {
        const { requestId } = req.params;
        const bungieId = req.user?.bungieId;

        if (!bungieId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        await divisionRequestService.cancelRequest(requestId, bungieId);

        res.json({
            success: true,
            message: 'Request cancelled'
        });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function getAllRequests(req: Request, res: Response): Promise<void> {
    try {
        const { status } = req.query;
        const requests = await divisionRequestService.getAllRequests(status as string);

        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getRequestById(req: Request, res: Response): Promise<void> {
    try {
        const { requestId } = req.params;
        const request = await divisionRequestService.getRequestById(requestId);

        if (!request) {
            res.status(404).json({ success: false, error: 'Request not found' });
            return;
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function approveRequest(req: Request, res: Response): Promise<void> {
    try {
        const { requestId } = req.params;
        const reviewerBungieId = req.user?.bungieId;

        if (!reviewerBungieId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const { request, division } = await divisionRequestService.approveRequest(
            requestId,
            reviewerBungieId
        );

        res.json({
            success: true,
            data: { request, division },
            message: `Division "${division.name}" created. Requester set as leader.`
        });
    } catch (error: any) {
        logger.error('Approve request error', { error: error.message });
        res.status(400).json({ success: false, error: error.message });
    }
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;
        const reviewerBungieId = req.user?.bungieId;

        if (!reviewerBungieId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const request = await divisionRequestService.rejectRequest(
            requestId,
            reviewerBungieId,
            reason
        );

        res.json({
            success: true,
            data: request,
            message: 'Request rejected'
        });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
}
