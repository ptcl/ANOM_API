import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents, getMyProfile, updateMyProfile } from '../controllers/agentController';
import { getProtocolStatus } from '../controllers/protocolController';
import { getAgentStats, createAnnouncement, getActivityLogs, getAuthLogs, getSystemStatus, updateSystemMaintenance, promoteAgent, adminUpdateAgent } from '../controllers/founderController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/status', getProtocolStatus);
router.get('/agents', getAllAgents);

router.get('/agents/:membershipType/:membershipId', authMiddleware, getAgentByMembership);
router.patch('/agents/:membershipType/:membershipId', authMiddleware, updateAgentByMembership);

router.get('/agent/profile', authMiddleware, getMyProfile);
router.patch('/agent/profile', authMiddleware, updateMyProfile);

// ============== ROUTES D'ADMINISTRATION ==============
router.patch('/founder/agents/:agentId', authMiddleware, adminMiddleware, adminUpdateAgent);

router.get('/founder/stats/agents', authMiddleware, adminMiddleware, getAgentStats);

router.post('/founder/announcements', authMiddleware, adminMiddleware, createAnnouncement);

router.get('/founder/logs/activity', authMiddleware, adminMiddleware, getActivityLogs);
router.get('/founder/logs/auth', authMiddleware, adminMiddleware, getAuthLogs);

router.get('/founder/system/status', authMiddleware, adminMiddleware, getSystemStatus);
router.post('/founder/system/maintenance', authMiddleware, adminMiddleware, updateSystemMaintenance);

router.post('/founder/agents/:agentId/promote', authMiddleware, adminMiddleware, promoteAgent);


export default router;
