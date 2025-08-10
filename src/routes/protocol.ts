import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents, getMyProfile, updateMyProfile } from '../controllers/Agent.controller';
import { getProtocolStatus } from '../controllers/Protocol.controller';
import { getAgentStats, getActivityLogs, getAuthLogs, getSystemStatus, updateSystemMaintenance, promoteAgent, adminUpdateAgent } from '../controllers/Founder.controller';
import { createContract, deleteContract, getAgentAllContracts, getAllContracts, getContractById, updateContract } from '../controllers/Contract.controller';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, updateAnnouncement } from '../controllers/Announcement.controller';
import { AccessMiddleware } from '../middlewares/Access.middleware';
import { IdentityMiddleware } from '../middlewares/Identity.middleware';

const router = Router();


router.get('/status', getProtocolStatus);
router.get('/agents', getAllAgents);

router.get('/agents/:membershipType/:membershipId', IdentityMiddleware, getAgentByMembership);
router.patch('/agents/:membershipType/:membershipId', IdentityMiddleware, updateAgentByMembership);

router.get('/agent/profile', IdentityMiddleware, getMyProfile);
router.patch('/agent/profile', IdentityMiddleware, updateMyProfile);

router.get('/agent/contracts', IdentityMiddleware, getAgentAllContracts);
router.get('/agent/contract/:contractId', IdentityMiddleware, getContractById);
router.post('/agent/contract', IdentityMiddleware, createContract);
router.delete('/agent/contract/:contractId', IdentityMiddleware, deleteContract);
router.patch('/agent/contract/:contractId', IdentityMiddleware, updateContract);



// ============== ROUTES FONDEURS ==============
router.patch('/founder/agents/:agentId', IdentityMiddleware, AccessMiddleware, adminUpdateAgent);
router.get('/founder/agents/:agentId/contracts', IdentityMiddleware, AccessMiddleware, getAgentAllContracts);

router.patch('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, updateContract);
router.get('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, getContractById);
router.get('/founder/contracts', IdentityMiddleware, AccessMiddleware, getAllContracts);

router.post('/founder/announcement', IdentityMiddleware, AccessMiddleware, createAnnouncement);
router.patch('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, updateAnnouncement);
router.delete('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, deleteAnnouncement);
router.get('/founder/announcements', IdentityMiddleware, AccessMiddleware, getAllAnnouncements);

router.get('/founder/logs/activity', IdentityMiddleware, AccessMiddleware, getActivityLogs);
router.get('/founder/logs/auth', IdentityMiddleware, AccessMiddleware, getAuthLogs);

router.get('/founder/system/status', IdentityMiddleware, AccessMiddleware, getSystemStatus);
router.post('/founder/system/maintenance', IdentityMiddleware, AccessMiddleware, updateSystemMaintenance);


export default router;
