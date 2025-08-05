import { Router } from 'express';
import authRoutes from './identity';
import destiny2Routes from './destiny2';
import protocolRoutes from './protocol';
import healthRoutes from './health';
import statusRoutes from './status';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use('/identity', authRoutes);
router.use('/health', healthRoutes);
router.use('/status', statusRoutes);
router.use('/destiny2', authMiddleware, destiny2Routes);
router.use('/protocol', protocolRoutes);

export { router as routes };