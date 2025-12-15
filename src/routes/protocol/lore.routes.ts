import { Router } from 'express';
import { createLore, updateLore, deleteLore, getAllLoresForFounders, getLoreById, getUnlockedLores, readLore, unlockLoreForAgent } from '../../controllers/lore.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ResolveAgentMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateLoreSchema, UpdateLoreSchema, UnlockLoreSchema } from '../../schemas/lore.schema';
import { LoreIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/lores', IdentityMiddleware, ActiveAgentMiddleware, getUnlockedLores);
router.get('/lore/:loreId', IdentityMiddleware, ActiveAgentMiddleware, validate(LoreIdParamSchema, { source: 'params' }), readLore);

router.get('/founder/lores', IdentityMiddleware, AccessMiddleware, getAllLoresForFounders);
router.post('/founder/lore', IdentityMiddleware, AccessMiddleware, validate(CreateLoreSchema), createLore);
router.get('/founder/lore/:loreId', IdentityMiddleware, AccessMiddleware, validate(LoreIdParamSchema, { source: 'params' }), getLoreById);
router.patch('/founder/lore/:loreId', IdentityMiddleware, AccessMiddleware, validate(LoreIdParamSchema, { source: 'params' }), validate(UpdateLoreSchema), updateLore);
router.delete('/founder/lore/:loreId', IdentityMiddleware, AccessMiddleware, validate(LoreIdParamSchema, { source: 'params' }), deleteLore);
router.post('/founder/lore/:loreId/unlock', IdentityMiddleware, AccessMiddleware, validate(LoreIdParamSchema, { source: 'params' }), validate(UnlockLoreSchema), ResolveAgentMiddleware, unlockLoreForAgent);

export default router;

