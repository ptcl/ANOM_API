import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents } from '../controllers/agentController';
import { getProtocolStatus } from '../controllers/protocolController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/agents', getAllAgents);
router.get('/agents/:membershipType/:membershipId', authMiddleware, getAgentByMembership);
router.patch('/agents/:membershipType/:membershipId', authMiddleware, updateAgentByMembership);

router.get('/status', getProtocolStatus);
export default router;
