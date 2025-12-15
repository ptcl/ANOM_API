import { Router } from 'express';
import authRoutes from './identity';
import destiny2Routes from './destiny';
import protocolRoutes from './protocol';
import statusRoutes from './status';
import { IdentityMiddleware } from '../middlewares/identity.middleware';

const router = Router();

router.use('/identity', authRoutes);
router.use('/status', statusRoutes);
router.use('/destiny2', IdentityMiddleware, destiny2Routes);
router.use('/protocol', protocolRoutes);

export { router as routes };