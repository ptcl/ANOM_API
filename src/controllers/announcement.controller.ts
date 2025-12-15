import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/announcement.model';
import { generateUniqueId } from '../utils/generate';
import { IAnnouncement } from '../types/announcement';
import { logger } from '../utils';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from '../schemas/announcement.schema';

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const data = req.body as CreateAnnouncementInput;

        let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        if (data.expiresAt) {
            const parsed = new Date(data.expiresAt);
            if (parsed > new Date()) {
                expiresAt = parsed;
            }
        }

        const newAnnouncement = await AnnouncementModel.create({
            announcementId: generateUniqueId(),
            title: data.title.trim(),
            content: data.content.trim(),
            priority: data.priority,
            status: data.status,
            visibility: data.visibility,
            targetGroup: data.targetGroup?.trim(),
            tags: data.tags?.filter(tag => tag.trim().length > 0) || [],
            expiresAt,
            createdBy: req.user?.agentId || '',
            readBy: []
        });

        logger.info('Announcement created', {
            announcementId: newAnnouncement.announcementId,
            createdBy: req.user?.agentId
        });

        return res.status(201).json({
            success: true,
            data: { announcement: newAnnouncement },
            message: 'Announcement created successfully'
        });
    } catch (error: any) {
        logger.error('Announcement creation error', {
            error: error.message,
            creatorId: req.user?.agentId
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
        const data = req.body as UpdateAnnouncementInput;

        const existingAnnouncement = await AnnouncementModel.findOne({ announcementId: id });
        if (!existingAnnouncement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        const updateData: Partial<IAnnouncement> = {};

        if (data.title) updateData.title = data.title.trim();
        if (data.content) updateData.content = data.content.trim();
        if (data.priority) updateData.priority = data.priority;
        if (data.status) updateData.status = data.status;
        if (data.visibility) updateData.visibility = data.visibility;
        if (data.targetGroup) updateData.targetGroup = data.targetGroup.trim();
        if (data.tags) updateData.tags = data.tags.filter(tag => tag.trim().length > 0);
        if (data.expiresAt) {
            const parsed = new Date(data.expiresAt);
            if (parsed > new Date()) updateData.expiresAt = parsed;
        }

        const updatedAnnouncement = await AnnouncementModel.findOneAndUpdate(
            { announcementId: id },
            { $set: updateData },
            { new: true }
        );

        logger.info('Announcement updated', { announcementId: id, updatedBy: req.user?.agentId });

        return res.json({
            success: true,
            data: { announcement: updatedAnnouncement },
            message: 'Announcement updated successfully'
        });
    } catch (error: any) {
        logger.error('Announcement update error', {
            error: error.message,
            announcementId: req.params.id,
            updaterId: req.user?.agentId
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

        logger.info('Announcement deleted:', {
            deleterId: req.user?.agentId,
            announcementId: id,
            title: announcement.title
        });

        return res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error: any) {
        logger.error('Announcement deletion error:', {
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
        logger.error('Public announcements fetch error:', {
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
        logger.error('Founder announcements fetch error:', {
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

        const announcement = await AnnouncementModel.findOne({ announcementId: id });
        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }

        const alreadyRead = announcement.readBy?.some((read: any) => read.agentId === agentId) ?? false;

        if (!alreadyRead) {
            await AnnouncementModel.findOneAndUpdate(
                { announcementId: id },
                {
                    $push: {
                        readBy: {
                            agentId: agentId,
                            readAt: new Date()
                        }
                    }
                }
            );
        }

        return res.json({
            success: true,
            message: 'Announcement marked as read'
        });
    } catch (error: any) {
        logger.error('Mark as read error:', {
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
