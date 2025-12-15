import { Router } from 'express';
import { getAllBadges, getBadgeStats, getBadgeById, createBadge, updateBadge, deleteBadge, giftBadgeBatch, revokeBadgeBatch, giftBadgesToAgent, revokeBadgesFromAgent } from '../../controllers/badge.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ResolveAgentMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateBadgeSchema, UpdateBadgeSchema, GetBadgesQuerySchema, GiftBadgeBatchSchema, GiftBadgesToAgentSchema } from '../../schemas/badge.schema';
import { BadgeIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/badges', validate(GetBadgesQuerySchema, { source: 'query' }), getAllBadges);
router.get('/badge/stats', getBadgeStats);
router.get('/badge/:badgeId', validate(BadgeIdParamSchema, { source: 'params' }), getBadgeById);
router.post('/founder/badge', IdentityMiddleware, AccessMiddleware, validate(CreateBadgeSchema), createBadge);
router.put('/founder/badge/:badgeId', IdentityMiddleware, AccessMiddleware, validate(BadgeIdParamSchema, { source: 'params' }), validate(UpdateBadgeSchema), updateBadge);
router.delete('/founder/badge/:badgeId', IdentityMiddleware, AccessMiddleware, validate(BadgeIdParamSchema, { source: 'params' }), deleteBadge);

// 1 badge  → N agents
router.post('/founder/badge/:badgeId/gift', IdentityMiddleware, AccessMiddleware, validate(GiftBadgeBatchSchema), giftBadgeBatch);
router.post('/founder/badge/:badgeId/revoke', IdentityMiddleware, AccessMiddleware, validate(GiftBadgeBatchSchema), revokeBadgeBatch);

// N badges → 1 agent
router.post('/founder/agent/:agentId/badges/gift', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(GiftBadgesToAgentSchema), giftBadgesToAgent);
router.post('/founder/agent/:agentId/badges/revoke', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(GiftBadgesToAgentSchema), revokeBadgesFromAgent);

export default router;


