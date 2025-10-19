import { Router } from 'express';
import { getAgentByMembership, updateAgentByMembership, getAllAgents, getAgentStatistics, repairProfile,getProfilAgent,updateProfilAgent } from '../controllers/agent.controller';
import { getProtocolStatus } from '../controllers/protocol.controller';
import { FounderUpdateAgent } from '../controllers/founder.controller';
import { createContract, deleteContract, getAgentAllContracts, getAllContracts, getContractById, updateContract } from '../controllers/contract.controller';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAllAnnouncementsForFounders, markAnnouncementAsRead, updateAnnouncement } from '../controllers/announcement.controller';
import { AccessMiddleware } from '../middlewares/access.middleware';
import { IdentityMiddleware } from '../middlewares/identity.middleware';
import { createEmblem, updateEmblem, deleteEmblem, getAllEmblems, getEmblemById } from '../controllers/emblem.controller';
import { accessChallenge, createChallenge, deleteChallenge, getAgentChallengeFragments, getAgentProgress, getAllChallenges, getAvailableChallenges, getChallengeById, submitChallengeAnswer, updateChallenge } from '../controllers/challenge.controller';

const router = Router();


router.get('/status', getProtocolStatus);
router.get('/agents', getAllAgents);

router.get('/agents/:membershipType/:membershipId', IdentityMiddleware, getAgentByMembership);
router.patch('/agents/:membershipType/:membershipId', IdentityMiddleware, AccessMiddleware, updateAgentByMembership);

router.get('/agent/profile', IdentityMiddleware, getProfilAgent);
router.patch('/agent/profile', IdentityMiddleware, updateProfilAgent);


// ============== ROUTES CONCTRACTS AGENTS (JOUEURS) ==============

router.get('/agent/contracts', IdentityMiddleware, getAgentAllContracts);
router.get('/agent/contract/:contractId', IdentityMiddleware, getContractById);
router.post('/agent/contract', IdentityMiddleware, createContract);
router.delete('/agent/contract/:contractId', IdentityMiddleware, deleteContract);
router.patch('/agent/contract/:contractId', IdentityMiddleware, updateContract);


// ============== ROUTES CHALLENGES AGENTS (JOUEURS) ==============

router.get('/challenges/available', getAvailableChallenges);
router.post('/agent/challenge/access', IdentityMiddleware, accessChallenge);
router.post('/agent/challenge/submit', IdentityMiddleware, submitChallengeAnswer);
router.get('/agent/challenge/progress', IdentityMiddleware, getAgentProgress);
router.get('/agent/challenge/:challengeId', IdentityMiddleware, getChallengeById);
router.get('/agent/challenge/:challengeId/progress', IdentityMiddleware, getAgentChallengeFragments);


// ============== ROUTES ANNONCES AGENTS (JOUEURS) ==============

router.get('/announcements', getAllAnnouncements);
router.post('/announcement/:id/read', IdentityMiddleware, markAnnouncementAsRead);


// ============== ROUTES EMBLEMS AGENTS (JOUEURS) ==============

router.get('/emblems', IdentityMiddleware, getAllEmblems);
router.get('/emblem/:emblemId', IdentityMiddleware, getEmblemById);


// ============== ROUTES FONDEURS ==============

router.get('/founder/agents/statistics', IdentityMiddleware, AccessMiddleware, getAgentStatistics);

router.post('/agent/profile/repair', IdentityMiddleware, repairProfile);
router.patch('/founder/agents/:agentId', IdentityMiddleware, AccessMiddleware, FounderUpdateAgent);
router.post('/founder/agents/:agentId/repair', IdentityMiddleware, AccessMiddleware, repairProfile);
router.get('/founder/agents/:agentId/contracts', IdentityMiddleware, AccessMiddleware, getAgentAllContracts);


// ============== ROUTES FONDEURS CONTRACTS ==============

router.get('/founder/contracts', IdentityMiddleware, AccessMiddleware, getAllContracts);
router.patch('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, updateContract);
router.get('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, getContractById);
router.delete('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, deleteContract);



// ============== ROUTES FONDEURS ANNOUNCEMENTS ==============

router.get('/founder/announcements', IdentityMiddleware, AccessMiddleware, getAllAnnouncementsForFounders);
router.post('/founder/announcement', IdentityMiddleware, AccessMiddleware, createAnnouncement);
router.patch('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, updateAnnouncement);
router.delete('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, deleteAnnouncement);


// ============== ROUTES FONDEURS EMBLEM ==============

router.post('/founder/emblem', IdentityMiddleware, AccessMiddleware, createEmblem);
router.get('/founder/emblems', IdentityMiddleware, AccessMiddleware, getAllEmblems);
router.patch('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, updateEmblem);
router.delete('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, deleteEmblem);
router.get('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, getEmblemById);

// ============== ROUTES FONDEURS CHALLENGE ==============

router.post('/founder/challenge', IdentityMiddleware, AccessMiddleware, createChallenge);
router.get('/founder/challenges', IdentityMiddleware, AccessMiddleware, getAllChallenges);
router.patch('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, updateChallenge);
router.delete('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, deleteChallenge);
router.get('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, getChallengeById);

export default router;
