import { Router } from 'express';
import { createContract, deleteContract, getAgentAllContracts, getAgentContractsById, getAllContracts, getContractById, updateContract, validateContract, validateContractPartial, revokeContract, unrevokeContract, cleanupExpiredEmblems } from '../../controllers/contract.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ResolveAgentMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateContractSchema, UpdateContractSchema, PartialValidationSchema } from '../../schemas/contract.schema';
import { ContractIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/agent/contracts', IdentityMiddleware, ActiveAgentMiddleware, getAgentAllContracts);
router.post('/agent/contract', IdentityMiddleware, ActiveAgentMiddleware, validate(CreateContractSchema), createContract);
router.get('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, validate(ContractIdParamSchema, { source: 'params' }), getContractById);
router.delete('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, validate(ContractIdParamSchema, { source: 'params' }), deleteContract);
router.patch('/agent/contract/:contractId', IdentityMiddleware, ActiveAgentMiddleware, validate(ContractIdParamSchema, { source: 'params' }), validate(UpdateContractSchema), updateContract);

router.get('/founder/contracts', IdentityMiddleware, AccessMiddleware, getAllContracts);
router.get('/founder/agent/:agentId/contracts', IdentityMiddleware, AccessMiddleware, ResolveAgentMiddleware, getAgentContractsById);
router.patch('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), validate(UpdateContractSchema), updateContract);
router.get('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), getContractById);
router.delete('/founder/contract/:contractId', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), deleteContract);
router.post('/founder/contract/:contractId/validate', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), validateContract);
router.post('/founder/contract/:contractId/validate-partial', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), validate(PartialValidationSchema), validateContractPartial);
router.post('/founder/contract/:contractId/revoke', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), revokeContract);
router.post('/founder/contract/:contractId/unrevoke', IdentityMiddleware, AccessMiddleware, validate(ContractIdParamSchema, { source: 'params' }), unrevokeContract);
router.post('/founder/contracts/cleanup', IdentityMiddleware, AccessMiddleware, cleanupExpiredEmblems);

export default router;


