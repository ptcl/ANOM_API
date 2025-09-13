import { Types } from 'mongoose';
export interface IAnnouncement {
    _id?: Types.ObjectId | string;
    announcementId?: string;
    title: string;
    content: string;
    createdBy: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    tags?: string[];
    readBy: Array<{
        agentId: Types.ObjectId | string;
        readAt: Date;
    }>;
    visibility: 'ALL' | 'FOUNDERS' | 'SPECIALISTS' | 'GROUP';
    targetGroup?: 'PROTOCOL' | 'AURORA' | 'ZENITH';
}
