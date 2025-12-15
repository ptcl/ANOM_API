import { Router } from 'express';
import { getProtocolStatus } from '../../controllers/protocol.controller';
import { syncAgentsDynamic } from '../../controllers/utils.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';

const router = Router();

router.get('/status', getProtocolStatus);
router.post('/sync-all', IdentityMiddleware, AccessMiddleware, syncAgentsDynamic);

export default router;
