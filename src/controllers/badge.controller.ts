import { Request, Response } from 'express';
import { Badge } from '../models/badge.model';
import { formatForUser } from '../utils';
import { Agent } from '../models/agent.model';
import { findAgentByIdentifier } from '../utils/verifyAgent.helper';

/**
 * Badge Controller
 * Gère les opérations CRUD sur les badges
 * Routes protégées par AccessMiddleware (FOUNDER uniquement)
 */

// GET /api/badges - Récupérer tous les badges
export const getAllBadges = async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            rarity,
            obtainable,
            linkedTier,
            linkedTimeline,
            page = '1',
            limit = '50'
        } = req.query;

        const query: any = {};

        if (rarity && typeof rarity === 'string') {
            query.rarity = rarity.toUpperCase();
        }

        if (obtainable !== undefined) {
            query.obtainable = obtainable === 'true';
        }

        if (linkedTier && !isNaN(Number(linkedTier))) {
            query.linkedTier = Number(linkedTier);
        }

        if (linkedTimeline && typeof linkedTimeline === 'string') {
            query.linkedTimeline = linkedTimeline;
        }

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        const [badges, total] = await Promise.all([
            Badge.find(query)
                .sort({ rarity: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Badge.countDocuments(query)
        ]);

        console.log('Badges retrieved:', {
            timestamp: formatForUser(),
            agentId: req.user?.agentId,
            total,
            page: pageNum,
            limit: limitNum,
            filters: query
        });

        return res.status(200).json({
            success: true,
            data: {
                badges,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });

    } catch (error: any) {
        console.error('Error retrieving badges:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            agentId: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve badges'
        });
    }
};

// GET /api/badges/:badgeId - Récupérer un badge spécifique
export const getBadgeById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId } = req.params;

        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid badge ID'
            });
        }

        const badge = await Badge.findOne({ badgeId: badgeId.trim() }).lean();

        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        console.log('Badge retrieved:', {
            timestamp: formatForUser(),
            badgeId: badge.badgeId,
            agentId: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            data: { badge }
        });

    } catch (error: any) {
        console.error('Error retrieving badge:', {
            timestamp: formatForUser(),
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve badge'
        });
    }
};

// POST /api/badges - Créer un nouveau badge (FOUNDER only)
export const createBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId, name, description, rarity, icon, obtainable, linkedTier, linkedTimeline } = req.body;

        // Validation
        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Badge ID is required'
            });
        }

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Badge name is required'
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Badge name too long (max 100 characters)'
            });
        }

        if (rarity && !['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(rarity)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid rarity (must be COMMON, RARE, EPIC, or LEGENDARY)'
            });
        }

        // Vérifier si le badge existe déjà
        const existingBadge = await Badge.findOne({ badgeId: badgeId.trim() });
        if (existingBadge) {
            return res.status(409).json({
                success: false,
                error: 'Badge with this ID already exists'
            });
        }

        // Créer le badge
        const newBadge = new Badge({
            badgeId: badgeId.trim(),
            name: name.trim(),
            description: description?.trim() || '',
            rarity: rarity || 'COMMON',
            icon: icon?.trim() || '',
            obtainable: obtainable !== undefined ? obtainable : true,
            linkedTier: linkedTier || undefined,
            linkedTimeline: linkedTimeline?.trim() || undefined
        });

        await newBadge.save();

        console.log('Badge created:', {
            timestamp: formatForUser(),
            badgeId: newBadge.badgeId,
            name: newBadge.name,
            createdBy: req.user?.agentId
        });

        return res.status(201).json({
            success: true,
            data: { badge: newBadge }
        });

    } catch (error: any) {
        console.error('Error creating badge:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            agentId: req.user?.agentId
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: Object.values(error.errors).map((e: any) => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to create badge'
        });
    }
};

// PUT /api/badges/:badgeId - Mettre à jour un badge (FOUNDER only)
export const updateBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId } = req.params;
        const updates = req.body;

        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid badge ID'
            });
        }

        // Empêcher la modification du badgeId
        if (updates.badgeId) {
            delete updates.badgeId;
        }

        // Validation des champs
        if (updates.name !== undefined) {
            if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Badge name cannot be empty'
                });
            }
            if (updates.name.length > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Badge name too long (max 100 characters)'
                });
            }
            updates.name = updates.name.trim();
        }

        if (updates.rarity && !['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(updates.rarity)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid rarity'
            });
        }

        if (updates.description !== undefined) {
            updates.description = updates.description.trim();
        }

        if (updates.icon !== undefined) {
            updates.icon = updates.icon.trim();
        }

        if (updates.linkedTimeline !== undefined) {
            updates.linkedTimeline = updates.linkedTimeline.trim();
        }

        const badge = await Badge.findOneAndUpdate(
            { badgeId: badgeId.trim() },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        console.log('Badge updated:', {
            timestamp: formatForUser(),
            badgeId: badge.badgeId,
            updatedFields: Object.keys(updates),
            updatedBy: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            data: { badge }
        });

    } catch (error: any) {
        console.error('Error updating badge:', {
            timestamp: formatForUser(),
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: Object.values(error.errors).map((e: any) => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to update badge'
        });
    }
};

// DELETE /api/badges/:badgeId - Supprimer un badge (FOUNDER only)
export const deleteBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { badgeId } = req.params;

        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid badge ID'
            });
        }

        const badge = await Badge.findOneAndDelete({ badgeId: badgeId.trim() });

        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        console.log('Badge deleted:', {
            timestamp: formatForUser(),
            badgeId: badge.badgeId,
            name: badge.name,
            deletedBy: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            message: 'Badge deleted successfully',
            data: { badge }
        });

    } catch (error: any) {
        console.error('Error deleting badge:', {
            timestamp: formatForUser(),
            error: error.message,
            badgeId: req.params.badgeId,
            agentId: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to delete badge'
        });
    }
};

// GET /api/badges/stats - Statistiques des badges
export const getBadgeStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const [
            total,
            byRarity,
            obtainableCount,
            unobtainableCount
        ] = await Promise.all([
            Badge.countDocuments(),
            Badge.aggregate([
                {
                    $group: {
                        _id: '$rarity',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Badge.countDocuments({ obtainable: true }),
            Badge.countDocuments({ obtainable: false })
        ]);

        const rarityStats = byRarity.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const stats = {
            total,
            obtainable: obtainableCount,
            unobtainable: unobtainableCount,
            byRarity: {
                COMMON: rarityStats.COMMON || 0,
                RARE: rarityStats.RARE || 0,
                EPIC: rarityStats.EPIC || 0,
                LEGENDARY: rarityStats.LEGENDARY || 0
            }
        };

        console.log('Badge stats retrieved:', {
            timestamp: formatForUser(),
            stats,
            agentId: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            data: { stats }
        });

    } catch (error: any) {
        console.error('Error retrieving badge stats:', {
            timestamp: formatForUser(),
            error: error.message,
            agentId: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve badge stats'
        });
    }
};
// POST /api/founder/badges/gift/:agentId/:badgeId - Donner un badge (par params)
export const giftBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId, badgeId } = req.params;

        // Validation
        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Badge ID is required'
            });
        }

        if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Agent ID is required'
            });
        }

        // Import du helper

        // Vérifier que le badge existe
        const badge = await Badge.findOne({ badgeId: badgeId.trim() });
        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        // Trouver l'agent avec le helper
        const agent = await findAgentByIdentifier(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        // Vérifier si l'agent possède déjà ce badge
        const hasBadge = agent.protocol?.badges?.some(
            (b: any) => b.badgeId?.toString() === badge._id.toString()
        );

        if (hasBadge) {
            return res.status(409).json({
                success: false,
                error: 'Agent already has this badge',
                data: {
                    agentName: agent.protocol?.agentName,
                    badgeName: badge.name
                }
            });
        }

        if (!agent.protocol) {
            return res.status(400).json({
                success: false,
                error: 'Agent protocol is incomplete'
            });
        }

        // Ajouter le badge
        agent.protocol.badges.push({
            badgeId: badge._id,
            obtainedAt: new Date()
        } as any);

        agent.updatedAt = new Date();
        await agent.save();

        console.log('Badge gifted to agent:', {
            timestamp: formatForUser(),
            badgeId: badge.badgeId,
            badgeName: badge.name,
            agentId: agent._id?.toString(),
            agentName: agent.protocol.agentName,
            bungieId: agent.bungieId,
            giftedBy: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            message: 'Badge successfully gifted to agent',
            data: {
                badge: {
                    badgeId: badge.badgeId,
                    name: badge.name,
                    rarity: badge.rarity
                },
                agent: {
                    agentName: agent.protocol.agentName,
                    bungieId: agent.bungieId,
                    uniqueName: agent.bungieUser?.uniqueName,
                    totalBadges: agent.protocol.badges.length
                },
                obtainedAt: agent.protocol.badges[agent.protocol.badges.length - 1].obtainedAt
            }
        });

    } catch (error: any) {
        console.error('Error gifting badge:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            params: req.params,
            giftedBy: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to gift badge'
        });
    }
};


// / DELETE /api / founder / badges / revoke /: agentId /: badgeId - Retirer un badge(par params)
export const revokeBadge = async (req: Request, res: Response): Promise<any> => {
    try {
        const { agentId, badgeId } = req.params;

        // Validation
        if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Badge ID is required'
            });
        }

        if (!agentId || typeof agentId !== 'string' || agentId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Agent ID is required'
            });
        }


        // Vérifier que le badge existe
        const badge = await Badge.findOne({ badgeId: badgeId.trim() });
        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        const agent = await findAgentByIdentifier(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        if (!agent.protocol) {
            return res.status(400).json({
                success: false,
                error: 'Agent protocol is incomplete'
            });
        }

        // Trouver l'index du badge
        const badgeIndex = agent.protocol.badges?.findIndex(
            (b: any) => b.badgeId?.toString() === badge._id.toString()
        ) ?? -1;

        if (badgeIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Agent does not have this badge',
                data: {
                    agentName: agent.protocol?.agentName,
                    badgeName: badge.name
                }
            });
        }

        // Récupérer les infos du badge avant suppression
        const removedBadge = agent.protocol.badges[badgeIndex];

        // Retirer le badge en utilisant splice sur le DocumentArray
        agent.protocol.badges.splice(badgeIndex, 1);

        agent.updatedAt = new Date();
        await agent.save();

        console.log('Badge revoked from agent:', {
            timestamp: formatForUser(),
            badgeId: badge.badgeId,
            badgeName: badge.name,
            agentId: agent._id?.toString(),
            agentName: agent.protocol.agentName,
            bungieId: agent.bungieId,
            obtainedAt: removedBadge.obtainedAt,
            revokedBy: req.user?.agentId
        });

        return res.status(200).json({
            success: true,
            message: 'Badge successfully revoked from agent',
            data: {
                badge: {
                    badgeId: badge.badgeId,
                    name: badge.name,
                    rarity: badge.rarity
                },
                agent: {
                    agentName: agent.protocol.agentName,
                    bungieId: agent.bungieId,
                    totalBadges: agent.protocol.badges.length
                },
                wasObtainedAt: removedBadge.obtainedAt
            }
        });

    } catch (error: any) {
        console.error('Error revoking badge:', {
            timestamp: formatForUser(),
            error: error.message,
            stack: error.stack,
            params: req.params,
            revokedBy: req.user?.agentId
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to revoke badge'
        });
    }
};