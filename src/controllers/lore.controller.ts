import { Request, Response } from 'express';
import { LoreModel } from '../models/lore.model';
import { generateUniqueId } from '../utils/generate';
import { ILore, ILorePage, LoreCategory, LoreStatus, LoreVisibility } from '../types/lore';
import { logger } from '../utils';

const VALID_CATEGORIES: LoreCategory[] = ['HISTORY', 'CHARACTER', 'LOCATION', 'EVENT', 'ARTIFACT', 'FACTION', 'TECHNOLOGY', 'OTHER'];
const VALID_STATUSES: LoreStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const VALID_VISIBILITIES: LoreVisibility[] = ['PUBLIC', 'AGENTS_ONLY', 'UNLOCKED_ONLY'];

const MAX_TITLE_LENGTH = 200;
const MAX_PAGE_CONTENT_LENGTH = 50000;
const MAX_SUMMARY_LENGTH = 500;
const MAX_PAGES = 100;

const validatePages = (pages: any[]): { valid: boolean; pages: ILorePage[]; error?: string } => {
    if (!Array.isArray(pages)) {
        return { valid: false, pages: [], error: 'Pages must be an array' };
    }

    if (pages.length > MAX_PAGES) {
        return { valid: false, pages: [], error: `Maximum ${MAX_PAGES} pages allowed` };
    }

    const formattedPages: ILorePage[] = [];

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (!page.content || typeof page.content !== 'string' || page.content.trim().length === 0) {
            return { valid: false, pages: [], error: `Page ${i + 1}: content is required` };
        }

        if (page.content.length > MAX_PAGE_CONTENT_LENGTH) {
            return { valid: false, pages: [], error: `Page ${i + 1}: content exceeds ${MAX_PAGE_CONTENT_LENGTH} characters` };
        }

        formattedPages.push({
            pageNumber: typeof page.pageNumber === 'number' ? page.pageNumber : i + 1,
            title: page.title?.trim().substring(0, MAX_TITLE_LENGTH) || '',
            content: page.content.trim()
        });
    }

    formattedPages.sort((a, b) => a.pageNumber - b.pageNumber);

    return { valid: true, pages: formattedPages };
};

export const createLore = async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            title, summary, pages, category, tags,
            parentLoreId, relatedLoreIds,
            isLocked, unlockConditions,
            coverImage, audio, externalLinks,
            author, status, visibility, order
        } = req.body;

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        if (title.length > MAX_TITLE_LENGTH) {
            return res.status(400).json({ success: false, error: `Title max ${MAX_TITLE_LENGTH} characters` });
        }

        if (!pages || !Array.isArray(pages) || pages.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one page is required' });
        }

        const pagesValidation = validatePages(pages);
        if (!pagesValidation.valid) {
            return res.status(400).json({ success: false, error: pagesValidation.error });
        }

        const loreData: Partial<ILore> = {
            loreId: generateUniqueId('LORE'),
            title: title.trim(),
            summary: summary?.trim().substring(0, MAX_SUMMARY_LENGTH) || '',
            pages: pagesValidation.pages,
            totalPages: pagesValidation.pages.length,
            category: VALID_CATEGORIES.includes(category?.toUpperCase()) ? category.toUpperCase() : 'OTHER',
            tags: Array.isArray(tags) ? tags.filter((t: any) => typeof t === 'string').slice(0, 20) : [],
            parentLoreId: parentLoreId?.trim() || '',
            relatedLoreIds: Array.isArray(relatedLoreIds) ? relatedLoreIds.filter((id: any) => typeof id === 'string') : [],
            isLocked: isLocked !== false,
            unlockConditions: {
                requiredTimelineIds: unlockConditions?.requiredTimelineIds || [],
                requiredEntryIds: unlockConditions?.requiredEntryIds || [],
                requiredLoreIds: unlockConditions?.requiredLoreIds || [],
                requiredFragments: typeof unlockConditions?.requiredFragments === 'number' ? unlockConditions.requiredFragments : 0,
                manualUnlock: !!unlockConditions?.manualUnlock
            },
            coverImage: coverImage?.trim() || '',
            audio: audio?.trim() || '',
            externalLinks: Array.isArray(externalLinks) ? externalLinks.filter((l: any) => typeof l === 'string') : [],
            author: author?.trim() || req.user?.agentId || '',
            status: VALID_STATUSES.includes(status?.toUpperCase()) ? status.toUpperCase() : 'DRAFT',
            visibility: VALID_VISIBILITIES.includes(visibility?.toUpperCase()) ? visibility.toUpperCase() : 'UNLOCKED_ONLY',
            order: typeof order === 'number' ? order : 0,
            unlockedBy: [],
            readBy: []
        };

        const newLore = await LoreModel.create(loreData);

        return res.status(201).json({
            success: true,
            data: { lore: newLore },
            message: 'Lore created successfully'
        });

    } catch (error: any) {
        logger.error('Lore creation error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateLore = async (req: Request, res: Response): Promise<any> => {
    try {
        const { loreId } = req.params;
        const updateFields = req.body;

        if (!loreId) {
            return res.status(400).json({ success: false, error: 'Lore ID required' });
        }

        const existingLore = await LoreModel.findOne({ loreId });
        if (!existingLore) {
            return res.status(404).json({ success: false, error: 'Lore not found' });
        }

        const updateData: any = { updatedAt: new Date() };

        if (updateFields.title !== undefined) {
            updateData.title = updateFields.title.trim().substring(0, MAX_TITLE_LENGTH);
        }
        if (updateFields.summary !== undefined) {
            updateData.summary = updateFields.summary.trim().substring(0, MAX_SUMMARY_LENGTH);
        }
        if (updateFields.pages !== undefined) {
            const pagesValidation = validatePages(updateFields.pages);
            if (!pagesValidation.valid) {
                return res.status(400).json({ success: false, error: pagesValidation.error });
            }
            updateData.pages = pagesValidation.pages;
            updateData.totalPages = pagesValidation.pages.length;
        }
        if (updateFields.category !== undefined && VALID_CATEGORIES.includes(updateFields.category.toUpperCase())) {
            updateData.category = updateFields.category.toUpperCase();
        }
        if (updateFields.tags !== undefined) {
            updateData.tags = Array.isArray(updateFields.tags) ? updateFields.tags.slice(0, 20) : [];
        }
        if (updateFields.parentLoreId !== undefined) {
            updateData.parentLoreId = updateFields.parentLoreId;
        }
        if (updateFields.relatedLoreIds !== undefined) {
            updateData.relatedLoreIds = updateFields.relatedLoreIds;
        }
        if (updateFields.isLocked !== undefined) {
            updateData.isLocked = !!updateFields.isLocked;
        }
        if (updateFields.unlockConditions !== undefined) {
            updateData.unlockConditions = updateFields.unlockConditions;
        }
        if (updateFields.coverImage !== undefined) {
            updateData.coverImage = updateFields.coverImage;
        }
        if (updateFields.audio !== undefined) {
            updateData.audio = updateFields.audio;
        }
        if (updateFields.status !== undefined && VALID_STATUSES.includes(updateFields.status.toUpperCase())) {
            updateData.status = updateFields.status.toUpperCase();
        }
        if (updateFields.visibility !== undefined && VALID_VISIBILITIES.includes(updateFields.visibility.toUpperCase())) {
            updateData.visibility = updateFields.visibility.toUpperCase();
        }
        if (updateFields.order !== undefined) {
            updateData.order = updateFields.order;
        }

        const updatedLore = await LoreModel.findOneAndUpdate(
            { loreId },
            { $set: updateData },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            data: { lore: updatedLore },
            message: 'Lore updated successfully'
        });

    } catch (error: any) {
        logger.error('Lore update error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const deleteLore = async (req: Request, res: Response): Promise<any> => {
    try {
        const { loreId } = req.params;

        if (!loreId) {
            return res.status(400).json({ success: false, error: 'Lore ID required' });
        }

        const lore = await LoreModel.findOneAndDelete({ loreId });
        if (!lore) {
            return res.status(404).json({ success: false, error: 'Lore not found' });
        }

        logger.info('Lore deleted:', { loreId, title: lore.title, deletedBy: req.user?.agentId });

        return res.status(200).json({
            success: true,
            message: 'Lore deleted successfully'
        });

    } catch (error: any) {
        logger.error('Lore deletion error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getAllLoresForFounders = async (req: Request, res: Response): Promise<any> => {
    try {
        const lores = await LoreModel.find()
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: { lores, count: lores.length },
            message: 'All lores retrieved successfully'
        });

    } catch (error: any) {
        logger.error('Lores fetch error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getLoreById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { loreId } = req.params;

        if (!loreId) {
            return res.status(400).json({ success: false, error: 'Lore ID required' });
        }

        const lore = await LoreModel.findOne({ loreId }).lean();
        if (!lore) {
            return res.status(404).json({ success: false, error: 'Lore not found' });
        }

        return res.status(200).json({
            success: true,
            data: { lore },
            message: 'Lore retrieved successfully'
        });

    } catch (error: any) {
        logger.error('Lore fetch error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getUnlockedLores = async (req: Request, res: Response): Promise<any> => {
    try {
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const lores = await LoreModel.find({
            status: 'PUBLISHED',
            $or: [
                { visibility: 'PUBLIC' },
                { isLocked: false },
                { 'unlockedBy.agentId': agentId }
            ]
        })
            .select('loreId title summary category tags coverImage totalPages order createdAt readBy')
            .sort({ order: 1, createdAt: -1 })
            .lean();

        const loresWithProgress = lores.map((lore: any) => {
            const agentRead = lore.readBy?.find((r: any) => r.agentId === agentId);
            return {
                loreId: lore.loreId,
                title: lore.title,
                summary: lore.summary,
                category: lore.category,
                tags: lore.tags,
                coverImage: lore.coverImage,
                totalPages: lore.totalPages,
                order: lore.order,
                createdAt: lore.createdAt,
                lastPageRead: agentRead?.lastPageRead || 0,
                isCompleted: (agentRead?.lastPageRead || 0) >= lore.totalPages
            };
        });

        return res.status(200).json({
            success: true,
            data: { lores: loresWithProgress, count: loresWithProgress.length },
            message: 'Unlocked lores retrieved successfully'
        });

    } catch (error: any) {
        logger.error('Unlocked lores fetch error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const readLore = async (req: Request, res: Response): Promise<any> => {
    try {
        const { loreId } = req.params;
        const { page } = req.query;
        const agentId = req.user?.agentId;

        if (!agentId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!loreId) {
            return res.status(400).json({ success: false, error: 'Lore ID required' });
        }

        const lore = await LoreModel.findOne({ loreId });
        if (!lore) {
            return res.status(404).json({ success: false, error: 'Lore not found' });
        }

        const isUnlocked = !lore.isLocked ||
            lore.visibility === 'PUBLIC' ||
            lore.unlockedBy?.some((u: any) => u.agentId === agentId);

        if (!isUnlocked) {
            return res.status(403).json({ success: false, error: 'Lore is locked' });
        }

        const requestedPage = parseInt(page as string) || 1;
        const pageIndex = Math.max(0, Math.min(requestedPage - 1, (lore.pages?.length || 1) - 1));
        const currentPage = lore.pages?.[pageIndex];

        if (!currentPage) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        const existingReadIndex = lore.readBy?.findIndex((r: any) => r.agentId === agentId);

        if (existingReadIndex !== undefined && existingReadIndex >= 0) {
            const currentLastPage = lore.readBy[existingReadIndex].lastPageRead || 0;
            if (requestedPage > currentLastPage) {
                await LoreModel.findOneAndUpdate(
                    { loreId, 'readBy.agentId': agentId },
                    {
                        $set: {
                            'readBy.$.lastPageRead': requestedPage,
                            'readBy.$.readAt': new Date()
                        }
                    }
                );
            }
        } else {
            await LoreModel.findOneAndUpdate(
                { loreId },
                {
                    $push: {
                        readBy: {
                            agentId,
                            readAt: new Date(),
                            lastPageRead: requestedPage
                        }
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                lore: {
                    loreId: lore.loreId,
                    title: lore.title,
                    category: lore.category,
                    coverImage: lore.coverImage,
                    audio: lore.audio,
                    totalPages: lore.totalPages,
                    relatedLoreIds: lore.relatedLoreIds
                },
                currentPage: {
                    pageNumber: currentPage.pageNumber,
                    title: currentPage.title,
                    content: currentPage.content
                },
                navigation: {
                    current: requestedPage,
                    total: lore.totalPages,
                    hasPrevious: requestedPage > 1,
                    hasNext: requestedPage < (lore.totalPages || 1)
                }
            },
            message: 'Page read successfully'
        });

    } catch (error: any) {
        logger.error('Lore read error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const unlockLoreForAgent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { loreId } = req.params;
        const agent = req.resolvedAgent!;
        const agentId = agent._id!.toString();

        const lore = await LoreModel.findOne({ loreId });
        if (!lore) {
            return res.status(404).json({ success: false, error: 'Lore not found' });
        }

        const alreadyUnlocked = lore.unlockedBy?.some((u: any) => u.agentId === agentId);
        if (alreadyUnlocked) {
            return res.status(400).json({ success: false, error: 'Lore already unlocked for this agent' });
        }

        await LoreModel.findOneAndUpdate(
            { loreId },
            { $push: { unlockedBy: { agentId, unlockedAt: new Date() } } }
        );

        return res.status(200).json({
            success: true,
            message: 'Lore unlocked for agent successfully'
        });

    } catch (error: any) {
        logger.error('Lore unlock error:', { error: error.message });
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
