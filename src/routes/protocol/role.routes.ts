import { Router } from 'express';
import * as roleController from '../../controllers/role.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ResolveAgentOptionalMiddleware } from '../../middlewares/resolveAgent.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateRoleSchema, UpdateRoleSchema, ReorderRolesSchema, AddAssignmentSchema } from '../../schemas/role.schema';
import { RoleIdParamSchema, BungieIdSchema } from '../../schemas/common.schema';

const router = Router();

router.post('/founder/role', IdentityMiddleware, AccessMiddleware, validate(CreateRoleSchema), roleController.create);
router.get('/founder/roles', IdentityMiddleware, AccessMiddleware, roleController.getAll);
router.put('/founder/roles/reorder', IdentityMiddleware, AccessMiddleware, validate(ReorderRolesSchema), roleController.reorder);
router.get('/founder/role/:roleId', IdentityMiddleware, AccessMiddleware, validate(RoleIdParamSchema, { source: 'params' }), roleController.getById);
router.put('/founder/role/:roleId', IdentityMiddleware, AccessMiddleware, validate(RoleIdParamSchema, { source: 'params' }), validate(UpdateRoleSchema), roleController.update);
router.delete('/founder/role/:roleId', IdentityMiddleware, AccessMiddleware, validate(RoleIdParamSchema, { source: 'params' }), roleController.deleteRole);
router.get('/founder/role/:roleId/agents', IdentityMiddleware, AccessMiddleware, validate(RoleIdParamSchema, { source: 'params' }), roleController.getAgents);

router.get('/founder/roles/assignments', IdentityMiddleware, AccessMiddleware, roleController.getAssignments);
router.post('/founder/roles/assignment', IdentityMiddleware, AccessMiddleware, validate(AddAssignmentSchema), ResolveAgentOptionalMiddleware, roleController.addAssignment);
router.delete('/founder/roles/assignment/:bungieId', IdentityMiddleware, AccessMiddleware, ResolveAgentOptionalMiddleware, roleController.removeAssignment);

export default router;

