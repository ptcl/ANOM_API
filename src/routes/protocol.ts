import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents, getMyProfile, updateMyProfile } from '../controllers/agentController';
import { getProtocolStatus } from '../controllers/protocolController';
import { getAgentStats, getActivityLogs, getAuthLogs, getSystemStatus, updateSystemMaintenance, promoteAgent, adminUpdateAgent } from '../controllers/founderController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { createContract, deleteContract, getAgentAllContracts, getAllContracts, getContractById, updateContract } from '../controllers/ContractController';
import { createAnnouncement } from '../controllers/AnnouncementController';

const router = Router();


router.get('/status', getProtocolStatus);
router.get('/agents', getAllAgents);

router.get('/agents/:membershipType/:membershipId', authMiddleware, getAgentByMembership);
router.patch('/agents/:membershipType/:membershipId', authMiddleware, updateAgentByMembership);

router.get('/agent/profile', authMiddleware, getMyProfile);
router.patch('/agent/profile', authMiddleware, updateMyProfile);

router.get('/agent/contracts', authMiddleware, getAgentAllContracts);
router.get('/agent/contract/:contractId', authMiddleware, getContractById);
router.post('/agent/contract', authMiddleware, createContract);
router.delete('/agent/contract/:contractId', authMiddleware, deleteContract);
router.patch('/agent/contract/:contractId', authMiddleware, updateContract);



// ============== ROUTES FONDEURS ==============
router.patch('/founder/agents/:agentId', authMiddleware, adminMiddleware, adminUpdateAgent);

router.get('/founder/stats/agents', authMiddleware, adminMiddleware, getAgentStats);

router.post('/founder/announcements', authMiddleware, adminMiddleware, createAnnouncement);

router.get('/founder/logs/activity', authMiddleware, adminMiddleware, getActivityLogs);
router.get('/founder/logs/auth', authMiddleware, adminMiddleware, getAuthLogs);

router.get('/founder/system/status', authMiddleware, adminMiddleware, getSystemStatus);
router.post('/founder/system/maintenance', authMiddleware, adminMiddleware, updateSystemMaintenance);

router.post('/founder/agents/:agentId/promote', authMiddleware, adminMiddleware, promoteAgent);

router.get('/founder/agents/:agentId/contracts', authMiddleware, adminMiddleware, getAgentAllContracts);
router.get('/founder/contract/:contractId', authMiddleware, adminMiddleware, getContractById);
router.get('/founder/contracts', authMiddleware, adminMiddleware, getAllContracts);




export default router;
