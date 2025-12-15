import { Router } from 'express';
import { generateRewardCodes, getAllRewardCodes, getRewardCodeById, deleteRewardCode, redeemRewardCode, getRewardCodeStats } from '../../controllers/rewardCode.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { GenerateRewardCodesSchema, RedeemRewardCodeSchema, GetRewardCodesQuerySchema } from '../../schemas/rewardCode.schema';

const router = Router();

router.post('/agent/reward-code/redeem', IdentityMiddleware, ActiveAgentMiddleware, validate(RedeemRewardCodeSchema), redeemRewardCode);

router.post('/founder/reward-codes/generate', IdentityMiddleware, AccessMiddleware, validate(GenerateRewardCodesSchema), generateRewardCodes);
router.get('/founder/reward-codes', IdentityMiddleware, AccessMiddleware, validate(GetRewardCodesQuerySchema, { source: 'query' }), getAllRewardCodes);
router.get('/founder/reward-codes/stats', IdentityMiddleware, AccessMiddleware, getRewardCodeStats);
router.get('/founder/reward-code/:codeId', IdentityMiddleware, AccessMiddleware, getRewardCodeById);
router.delete('/founder/reward-code/:codeId', IdentityMiddleware, AccessMiddleware, deleteRewardCode);

export default router;

