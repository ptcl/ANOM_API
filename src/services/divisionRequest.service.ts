import { DivisionRequest, IDivisionRequest } from '../models/divisionRequest.model';
import { generateUniqueId } from '../utils/generate';
import { logger } from '../utils';
import * as divisionService from './division.service';

interface CreateRequestInput {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export async function createRequest(data: CreateRequestInput, requestedBy: string, requestedByName?: string): Promise<IDivisionRequest> {
    const existingPending = await DivisionRequest.findOne({ requestedBy, status: 'PENDING' });

    if (existingPending) {
        throw new Error('You already have a pending division request');
    }

    const request = await DivisionRequest.create({
        requestId: generateUniqueId('DIVREQ'),
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        requestedBy,
        requestedByName,
        status: 'PENDING'
    });

    logger.info('Division request created', { requestId: request.requestId, requestedBy });

    return request;
}

export async function getAllRequests(status?: string): Promise<IDivisionRequest[]> {
    const filter: any = {};
    if (status) {
        filter.status = status.toUpperCase();
    }
    return DivisionRequest.find(filter).sort({ createdAt: -1 });
}

export async function getMyRequests(bungieId: string): Promise<IDivisionRequest[]> {
    return DivisionRequest.find({ requestedBy: bungieId }).sort({ createdAt: -1 });
}

export async function getRequestById(requestId: string): Promise<IDivisionRequest | null> {
    return DivisionRequest.findOne({ requestId });
}

export async function approveRequest(requestId: string, reviewerBungieId: string): Promise<{ request: IDivisionRequest; division: any }> {
    const request = await DivisionRequest.findOne({ requestId });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
        throw new Error('Request is not pending');
    }

    const division = await divisionService.createDivision({
        name: request.name,
        description: request.description,
        color: request.color,
        icon: request.icon
    });

    request.status = 'APPROVED';
    request.reviewedBy = reviewerBungieId;
    request.reviewedAt = new Date();
    request.createdDivisionId = division.divisionId;
    await request.save();

    await divisionService.setLeader(division.divisionId, request.requestedBy);

    logger.info('Division request approved', {
        requestId,
        divisionId: division.divisionId,
        reviewedBy: reviewerBungieId
    });

    return { request, division };
}

export async function rejectRequest(requestId: string, reviewerBungieId: string, reason?: string): Promise<IDivisionRequest> {
    const request = await DivisionRequest.findOne({ requestId });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
        throw new Error('Request is not pending');
    }

    request.status = 'REJECTED';
    request.reviewedBy = reviewerBungieId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason;
    await request.save();

    logger.info('Division request rejected', {
        requestId,
        reviewedBy: reviewerBungieId,
        reason
    });

    return request;
}

export async function cancelRequest(requestId: string, bungieId: string): Promise<IDivisionRequest> {
    const request = await DivisionRequest.findOne({ requestId });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.requestedBy !== bungieId) {
        throw new Error('You can only cancel your own requests');
    }

    if (request.status !== 'PENDING') {
        throw new Error('Can only cancel pending requests');
    }

    await DivisionRequest.deleteOne({ _id: request._id });

    logger.info('Division request cancelled', { requestId, bungieId });

    return request;
}
