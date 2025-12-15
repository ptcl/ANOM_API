import { Router } from 'express';
import { DeactivateOwnAccount, getProfilAgent, syncAgentStats, updateProfilAgent } from '../../controllers/agent.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ResolveAgentMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateAgentProfileSchema, FounderUpdateAgentSchema, PromoteDemoteSchema, DeactivateAgentSchema, DeleteAgentSchema } from '../../schemas/agent.schema';
import { FounderAgentStatistics, FounderDeactivateAgent, FounderDeleteAgent, FounderReactivateAgent, FounderRepairProfile, FounderUpdateAgent, GetDeactivatedAgents, promoteAgent, demoteAgent } from '../../controllers/founder.controller';

const router = Router();

router.post("/agent/sync-stats", IdentityMiddleware, ActiveAgentMiddleware, syncAgentStats);
router.get('/agent/profile', IdentityMiddleware, ActiveAgentMiddleware, getProfilAgent);
router.patch('/agent/profile', IdentityMiddleware, ActiveAgentMiddleware, validate(UpdateAgentProfileSchema), updateProfilAgent);
router.get('/agent/deactivate', IdentityMiddleware, ActiveAgentMiddleware, DeactivateOwnAccount);

router.get('/founder/agents/deactivated', IdentityMiddleware, AccessMiddleware, GetDeactivatedAgents);
router.get('/founder/agents/statistics', IdentityMiddleware, AccessMiddleware, FounderAgentStatistics);
router.post('/founder/agent/:agentId/repair', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, FounderRepairProfile);
router.patch('/founder/agent/:agentId', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(FounderUpdateAgentSchema), FounderUpdateAgent);
router.delete('/founder/agent/:agentId', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(DeleteAgentSchema), FounderDeleteAgent);
router.patch('/founder/agent/:agentId/deactivate', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(DeactivateAgentSchema), FounderDeactivateAgent);
router.patch('/founder/agent/:agentId/reactivate', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, FounderReactivateAgent);

// Promote / Demote
router.post('/founder/agent/:agentId/promote', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(PromoteDemoteSchema), promoteAgent);
router.post('/founder/agent/:agentId/demote', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, validate(PromoteDemoteSchema), demoteAgent);

export default router;



