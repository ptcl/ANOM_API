import { Router } from 'express';
import { createEmblem, deleteEmblem, getAllEmblems, getEmblemById, updateEmblem } from '../../controllers/emblem.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateEmblemSchema, UpdateEmblemSchema, GetEmblemsQuerySchema } from '../../schemas/emblem.schema';
import { EmblemIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/emblems', IdentityMiddleware, ActiveAgentMiddleware, validate(GetEmblemsQuerySchema, { source: 'query' }), getAllEmblems);
router.get('/emblem/:emblemId', IdentityMiddleware, ActiveAgentMiddleware, validate(EmblemIdParamSchema, { source: 'params' }), getEmblemById);

router.post('/founder/emblem', IdentityMiddleware, AccessMiddleware, validate(CreateEmblemSchema), createEmblem);
router.get('/founder/emblems', IdentityMiddleware, AccessMiddleware, validate(GetEmblemsQuerySchema, { source: 'query' }), getAllEmblems);
router.patch('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, validate(EmblemIdParamSchema, { source: 'params' }), validate(UpdateEmblemSchema), updateEmblem);
router.delete('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, validate(EmblemIdParamSchema, { source: 'params' }), deleteEmblem);
router.get('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, validate(EmblemIdParamSchema, { source: 'params' }), getEmblemById);

export default router;

