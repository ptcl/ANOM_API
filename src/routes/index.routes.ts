import { Router } from 'express';
import identityRoutes from './identity.routes';
import destinyRoutes from './destiny.routes';
import protocolRoutes from './protocol.routes';
import healthRoutes from './health.routes';
import statusRoutes from './status.routes';
import { IdentityMiddleware } from '../middlewares/Identity.middleware';

const router = Router();

router.use('/identity', identityRoutes);
router.use('/health', healthRoutes);
router.use('/status', statusRoutes);
router.use('/destiny', IdentityMiddleware, destinyRoutes);
router.use('/protocol', protocolRoutes);

export { router as routes };