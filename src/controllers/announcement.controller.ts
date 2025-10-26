import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/announcement.model';
import { generateUniqueId } from '../utils/generate';
import { IAnnouncement } from '../types/announcement';
import { formatForUser } from '../utils';

const VALID_PRIORITIES: IAnnouncement['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const VALID_STATUSES: IAnnouncement['status'][] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const VALID_VISIBILITIES: IAnnouncement['visibility'][] = ['ALL', "AGENT", "ECHO", "ORACLE", "ARCHITECT", "FOUNDER", "EMISSARY", 'GROUP'];

const VALID_TARGET_GROUPS: NonNullable<IAnnouncement['targetGroup']>[] = ['PROTOCOL', 'AURORA', 'ZENITH'];

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

const validateAnnouncementData = (title?: string, content?: string): { isValid: boolean; error?: string } => {
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0 || title.length > MAX_TITLE_LENGTH) {
            return { isValid: false, error: 'Invalid title' };
        }
    }

    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim().length === 0 || content.length > MAX_CONTENT_LENGTH) {
            return { isValid: false, error: 'Invalid content' };
        }
    }

    return { isValid: true };
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, priority, status, visibility, targetGroup, tags, expiresAt } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const validation = validateAnnouncementData(title, content);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        let parsedExpiresAt = null;
        if (expiresAt) {
            parsedExpiresAt = new Date(expiresAt);
            if (isNaN(parsedExpiresAt.getTime()) || parsedExpiresAt <= new Date()) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid expiration date'
                });
            }
        }

        const sanitizedData: Partial<IAnnouncement> = {
            announcementId: generateUniqueId(),
            title: title.trim(),
            content: content.trim(),
            priority: VALID_PRIORITIES.includes(priority) ? priority : 'MEDIUM',
            status: VALID_STATUSES.includes(status) ? status : 'PUBLISHED',
            visibility: VALID_VISIBILITIES.includes(visibility) ? visibility : 'ALL',
            targetGroup: targetGroup && VALID_TARGET_GROUPS.includes(targetGroup) ? targetGroup : undefined,
            tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0).slice(0, 10) : [],
            expiresAt: parsedExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
            createdBy: req.user?.agentId || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            readBy: []
        };

        const newAnnouncement = await AnnouncementModel.create(sanitizedData);

        return res.status(201).json({
            success: true,
            data: {
                announcement: newAnnouncement
            },
            message: 'Announcement created successfully'
        });
    } catch (error: any) {
        console.error('Announcement creation error:', {
            timestamp: formatForUser(),
            creatorId: req.user?.agentId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, priority, status, visibility, targetGroup, tags, expiresAt } = req.body;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid announcement ID'
            });
        }

        const existingAnnouncement = await AnnouncementModel.findById(id);
        if (!existingAnnouncement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        const updateData: Partial<IAnnouncement> = {
            updatedAt: new Date()
        };

        const validation = validateAnnouncementData(title, content);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        if (title !== undefined) {
            updateData.title = title.trim();
        }

        if (content !== undefined) {
            updateData.content = content.trim();
        }

        if (priority !== undefined && VALID_PRIORITIES.includes(priority)) {
            updateData.priority = priority;
        }

        if (status !== undefined && VALID_STATUSES.includes(status)) {
            updateData.status = status;
        }

        if (visibility !== undefined && VALID_VISIBILITIES.includes(visibility)) {
            updateData.visibility = visibility;
        }

        if (targetGroup !== undefined && VALID_TARGET_GROUPS.includes(targetGroup)) {
            updateData.targetGroup = targetGroup;
        }

        if (tags !== undefined && Array.isArray(tags)) {
            updateData.tags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0).slice(0, 10);
        }

        if (expiresAt !== undefined) {
            const parsedExpiresAt = new Date(expiresAt);
            if (!isNaN(parsedExpiresAt.getTime()) && parsedExpiresAt > new Date()) {
                updateData.expiresAt = parsedExpiresAt;
            }
        }

        const updatedAnnouncement = await AnnouncementModel.findOneAndUpdate(
            { announcementId: id },
            { $set: updateData },
            { new: true }
        );

        return res.json({
            success: true,
            data: {
                announcement: updatedAnnouncement
            },
            message: 'Announcement updated successfully'
        });
    } catch (error: any) {
        console.error('Announcement update error:', {
            timestamp: formatForUser(),
            updaterId: req.user?.agentId,
            announcementId: req.params.id,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid announcement ID'
            });
        }

        const announcement = await AnnouncementModel.findOneAndDelete({ announcementId: id });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        console.log('Announcement deleted:', {
            timestamp: formatForUser(),
            deleterId: req.user?.agentId,
            announcementId: id,
            title: announcement.title
        });

        return res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error: any) {
        console.error('Announcement deletion error:', {
            timestamp: formatForUser(),
            deleterId: req.user?.agentId,
            announcementId: req.params.id,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await AnnouncementModel.find({
            status: 'PUBLISHED',
            visibility: { $in: ['ALL'] },
            expiresAt: { $gt: new Date() }
        })
            .select('title content priority status visibility tags createdAt updatedAt createdBy')
            .sort({ createdAt: -1 })
            .lean();

        const formattedAnnouncements = announcements.map(announcement => ({
            id: announcement._id,
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority || 'MEDIUM',
            status: announcement.status,
            tags: announcement.tags || [],
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt
        }));

        return res.json({
            success: true,
            data: {
                announcements: formattedAnnouncements,
                count: formattedAnnouncements.length
            },
            message: 'Public announcements retrieved successfully'
        });
    } catch (error: any) {
        console.error('Public announcements fetch error:', {
            timestamp: formatForUser(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const getAllAnnouncementsForFounders = async (req: Request, res: Response) => {
    try {
        const announcements = await AnnouncementModel.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: {
                announcements,
                count: announcements.length
            },
            message: 'All announcements retrieved successfully'
        });
    } catch (error: any) {
        console.error('Founder announcements fetch error:', {
            timestamp: formatForUser(),
            founderId: req.user?.agentId,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const markAnnouncementAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid announcement ID'
            });
        }

        const announcement = await AnnouncementModel.findById(id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        const alreadyRead = announcement.readBy.some((read: any) => read.agentId.toString() === agentId);

        if (!alreadyRead) {
            await AnnouncementModel.findByIdAndUpdate(id, {
                $push: {
                    readBy: {
                        agentId: agentId,
                        readAt: new Date()
                    }
                }
            });
        }

        return res.json({
            success: true,
            message: 'Announcement marked as read'
        });
    } catch (error: any) {
        console.error('Mark as read error:', {
            timestamp: formatForUser(),
            agentId: req.user?.agentId,
            announcementId: req.params.id,
            ip: req.ip
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
