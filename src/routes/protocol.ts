import { Router } from 'express';
import { DeactivateOwnAccount, getAllAgents, getProfilAgent, syncAgentStats, updateProfilAgent } from '../controllers/agent.controller';
import { getProtocolStatus } from '../controllers/protocol.controller';
import { FounderAgentStatistics, FounderDeactivateAgent, FounderDeleteAgent, FounderReactivateAgent, FounderRepairProfile, FounderUpdateAgent, GetDeactivatedAgents } from '../controllers/founder.controller';
import { createContract, deleteContract, getAgentAllContracts, getAllContracts, getContractById, updateContract } from '../controllers/contract.controller';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAllAnnouncementsForFounders, markAnnouncementAsRead, updateAnnouncement } from '../controllers/announcement.controller';
import { AccessMiddleware } from '../middlewares/access.middleware';
import { IdentityMiddleware } from '../middlewares/identity.middleware';
import { createEmblem, updateEmblem, deleteEmblem, getAllEmblems, getEmblemById } from '../controllers/emblem.controller';
import { accessChallenge, createChallenge, deleteChallenge, getAgentChallengeFragments, getAgentProgress, getAllChallenges, getAvailableChallenges, getChallengeById, submitChallengeAnswer, updateChallenge } from '../controllers/challenge.controller';
import { createBadge, deleteBadge, getAllBadges, getBadgeById, getBadgeStats, giftBadge, revokeBadge, updateBadge } from '../controllers/badge.controller';
import { ActiveAgentMiddleware } from '../middlewares/activeAgent.middleware';
import { syncAgentsDynamic } from '../controllers/utils.controller';

const router = Router();


router.get('/status', getProtocolStatus);
router.get('/agents', getAllAgents);
router.post("/agent/sync-stats", IdentityMiddleware, ActiveAgentMiddleware, syncAgentStats);
router.post('/sync-all', IdentityMiddleware, AccessMiddleware, syncAgentsDynamic);

// ============== ROUTES BADGES (PUBLIC) ==============

router.get('/badges', getAllBadges);
router.get('/badge/stats', getBadgeStats);
router.get('/badge/:badgeId', getBadgeById);

// ============== ROUTES AGENTS (JOUEURS) ==============

router.get('/agent/profile', IdentityMiddleware, ActiveAgentMiddleware, getProfilAgent);
router.patch('/agent/profile', IdentityMiddleware, ActiveAgentMiddleware, updateProfilAgent);
router.get('/agent/deactivate', IdentityMiddleware, ActiveAgentMiddleware, DeactivateOwnAccount);


// ============== ROUTES CONCTRACTS AGENTS (JOUEURS) ==============

router.get('/agent/contracts', IdentityMiddleware, ActiveAgentMiddleware, getAgentAllContracts);
router.post('/agent/contract', IdentityMiddleware, ActiveAgentMiddleware, createContract);
router.get('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, getContractById);
router.delete('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, deleteContract);
router.patch('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, updateContract);



// ============== ROUTES CONCTRACTS AGENTS (JOUEURS) ==============

router.get('/agent/contracts', IdentityMiddleware, ActiveAgentMiddleware, getAgentAllContracts);
router.post('/agent/contract', IdentityMiddleware, ActiveAgentMiddleware, createContract);
router.get('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, getContractById);
router.delete('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, deleteContract);
router.patch('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, updateContract);


// ============== ROUTES CHALLENGES AGENTS (JOUEURS) ==============

router.get('/challenges/available', getAvailableChallenges);
router.post('/agent/challenge/access', IdentityMiddleware, ActiveAgentMiddleware, accessChallenge);
router.post('/agent/challenge/submit', IdentityMiddleware, ActiveAgentMiddleware, submitChallengeAnswer);
router.get('/agent/challenge/progress', IdentityMiddleware, ActiveAgentMiddleware, getAgentProgress);
router.get('/agent/challenge/:challengeId', IdentityMiddleware, ActiveAgentMiddleware, getChallengeById);
router.get('/agent/challenge/:challengeId/progress', IdentityMiddleware, ActiveAgentMiddleware, getAgentChallengeFragments);


// ============== ROUTES ANNONCES AGENTS (JOUEURS) ==============

router.get('/announcements', getAllAnnouncements);
router.post('/announcement/:id/read', IdentityMiddleware, ActiveAgentMiddleware, markAnnouncementAsRead);


// ============== ROUTES EMBLEMS AGENTS (JOUEURS) ==============

router.get('/emblems', IdentityMiddleware, ActiveAgentMiddleware, getAllEmblems);
router.get('/emblem/:emblemId', IdentityMiddleware, ActiveAgentMiddleware, getEmblemById);


// ============== ROUTES FONDEURS ==============

router.get('/founder/agents/deactivated', IdentityMiddleware, AccessMiddleware, GetDeactivatedAgents);
router.get('/founder/agents/statistics', IdentityMiddleware, AccessMiddleware, FounderAgentStatistics);
router.post('/founder/agent/:agentId/repair', IdentityMiddleware, AccessMiddleware, FounderRepairProfile);
router.get('/founder/agent/:agentId/contracts', IdentityMiddleware, AccessMiddleware, getAgentAllContracts);

// ============== ROUTES FONDEURS AGENT ==============


router.patch('/founder/agent/:agentId', IdentityMiddleware, AccessMiddleware, FounderUpdateAgent);
router.delete('/founder/agent/:agentId', IdentityMiddleware, AccessMiddleware, FounderDeleteAgent);
router.patch('/founder/agent/:agentId/deactivate', IdentityMiddleware, AccessMiddleware, FounderDeactivateAgent);
router.patch('/founder/agent/:agentId/reactivate', IdentityMiddleware, AccessMiddleware, FounderReactivateAgent);

// ============== ROUTES FONDEURS BADGES ==============

router.post('/founder/badge/create', IdentityMiddleware, AccessMiddleware, createBadge);
router.put('/founder/badge/:badgeId', IdentityMiddleware, AccessMiddleware, updateBadge);
router.delete('/founder/badge/:badgeId', IdentityMiddleware, AccessMiddleware, deleteBadge);
router.post('/founder/badge/gift/:agentId/:badgeId', IdentityMiddleware, AccessMiddleware, giftBadge);
router.delete('/founder/badge/revoke/:agentId/:badgeId', IdentityMiddleware, AccessMiddleware, revokeBadge);


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

router.post('/founder/emblem/create', IdentityMiddleware, AccessMiddleware, createEmblem);
router.get('/founder/emblems', IdentityMiddleware, AccessMiddleware, getAllEmblems);
router.patch('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, updateEmblem);
router.delete('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, deleteEmblem);
router.get('/founder/emblem/:emblemId', IdentityMiddleware, AccessMiddleware, getEmblemById);

// ============== ROUTES FONDEURS CHALLENGE ==============

router.post('/founder/challenge/create', IdentityMiddleware, AccessMiddleware, createChallenge);
router.get('/founder/challenges', IdentityMiddleware, AccessMiddleware, getAllChallenges);
router.patch('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, updateChallenge);
router.delete('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, deleteChallenge);
router.get('/founder/challenge/:challengeId', IdentityMiddleware, AccessMiddleware, getChallengeById);

export default router;
