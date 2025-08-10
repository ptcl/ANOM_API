import { Router } from 'express';

import { IdentityMiddleware } from '../middlewares/Identity.middleware';
import destinyRoutes from './destiny.routes';
import healthRoutes from './health.routes';
import identityRoutes from './identity.routes';
import protocolRoutes from './protocol.routes';
import statusRoutes from './status.routes';

const router = Router();

router.use('/identity', identityRoutes);
router.use('/health', healthRoutes);
router.use('/status', statusRoutes);
router.use('/destiny', IdentityMiddleware, destinyRoutes);
router.use('/protocol', protocolRoutes);

export { router as routes };