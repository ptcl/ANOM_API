import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents, getMyProfile, updateMyProfile } from '../controllers/Agent.controller';
import { getProtocolStatus } from '../controllers/Protocol.controller';
import { FounderUpdateAgent } from '../controllers/Founder.controller';
import { createContract, deleteContract, getAgentAllContracts, getAllContracts, getContractById, updateContract } from '../controllers/Contract.controller';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, updateAnnouncement } from '../controllers/Announcement.controller';
import { AccessMiddleware } from '../middlewares/Access.middleware';
import { IdentityMiddleware } from '../middlewares/Identity.middleware';
import { createEmblem, updateEmblem, deleteEmblem, getAllEmblems, getEmblemById } from '../controllers/Emblem.controller';

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
router.patch('/founder/agents/:agentId', IdentityMiddleware, AccessMiddleware, FounderUpdateAgent);
router.get('/founder/agents/:agentId/contracts', IdentityMiddleware, AccessMiddleware, getAgentAllContracts);

router.patch('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, updateContract);
router.get('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, getContractById);
router.get('/founder/contracts', IdentityMiddleware, AccessMiddleware, getAllContracts);

router.post('/founder/announcement', IdentityMiddleware, AccessMiddleware, createAnnouncement);
router.patch('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, updateAnnouncement);
router.delete('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, deleteAnnouncement);
router.get('/founder/announcements', IdentityMiddleware, AccessMiddleware, getAllAnnouncements);


// ============== ROUTES FONDEURS EMBLEM ==============

router.post('/founder/emblem', IdentityMiddleware, AccessMiddleware, createEmblem);
router.patch('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, updateEmblem);
router.delete('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, deleteEmblem);
router.get('/founder/emblems', IdentityMiddleware, AccessMiddleware, getAllEmblems);
router.get('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, getEmblemById);

export default router;
