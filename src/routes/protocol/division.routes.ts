import { Router } from 'express';
import * as divisionController from '../../controllers/division.controller';
import * as divisionRequestController from '../../controllers/divisionRequest.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { LeaderOrFounderMiddleware } from '../../middlewares/leaderOrFounder.middleware';
import { ResolveAgentMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateDivisionSchema, UpdateDivisionSchema, SetLeaderSchema, AddMemberSchema, DivisionRequestSchema, RejectRequestSchema } from '../../schemas/division.schema';
import { DivisionIdParamSchema, RequestIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/agent/division', IdentityMiddleware, divisionController.getMyDivision);
router.post('/agent/division/request', IdentityMiddleware, validate(DivisionRequestSchema), divisionRequestController.createRequest);
router.get('/agent/division/requests', IdentityMiddleware, divisionRequestController.getMyRequests);
router.delete('/agent/division/request/:requestId', IdentityMiddleware, validate(RequestIdParamSchema, { source: 'params' }), divisionRequestController.cancelRequest);

router.post('/leader/division/:divisionId/members', IdentityMiddleware, LeaderOrFounderMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), validate(AddMemberSchema), ResolveAgentMiddleware, divisionController.addMember);
router.delete('/leader/division/:divisionId/members/:identifier', IdentityMiddleware, LeaderOrFounderMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), ResolveAgentMiddleware, divisionController.removeMember);
router.post('/leader/division/:divisionId/leave', IdentityMiddleware, LeaderOrFounderMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), divisionController.leaderLeave);

router.get('/founder/division/requests', IdentityMiddleware, AccessMiddleware, divisionRequestController.getAllRequests);
router.get('/founder/division/request/:requestId', IdentityMiddleware, AccessMiddleware, validate(RequestIdParamSchema, { source: 'params' }), divisionRequestController.getRequestById);
router.post('/founder/division/request/:requestId/approve', IdentityMiddleware, AccessMiddleware, validate(RequestIdParamSchema, { source: 'params' }), divisionRequestController.approveRequest);
router.post('/founder/division/request/:requestId/reject', IdentityMiddleware, AccessMiddleware, validate(RequestIdParamSchema, { source: 'params' }), validate(RejectRequestSchema), divisionRequestController.rejectRequest);

router.post('/founder/division', IdentityMiddleware, AccessMiddleware, validate(CreateDivisionSchema), divisionController.create);
router.get('/founder/divisions', IdentityMiddleware, AccessMiddleware, divisionController.getAll);
router.get('/founder/division/:divisionId', IdentityMiddleware, AccessMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), divisionController.getById);
router.put('/founder/division/:divisionId', IdentityMiddleware, AccessMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), validate(UpdateDivisionSchema), divisionController.update);
router.delete('/founder/division/:divisionId', IdentityMiddleware, AccessMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), divisionController.deleteDivision);
router.get('/founder/division/:divisionId/agents', IdentityMiddleware, AccessMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), divisionController.getAgents);
router.put('/founder/division/:divisionId/leader', IdentityMiddleware, AccessMiddleware, validate(DivisionIdParamSchema, { source: 'params' }), validate(SetLeaderSchema), ResolveAgentMiddleware, divisionController.setLeader);

export default router;




