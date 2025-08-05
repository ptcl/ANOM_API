import { Router } from 'express';
import authRoutes from './identity';
import destiny2Routes from './destiny2';
import protocolRoutes from './protocol';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use('/identity', authRoutes);

router.use('/destiny2', authMiddleware, destiny2Routes);
router.use('/protocol', protocolRoutes);

router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'AN0M API is running',
        data: {
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        }
    });
});

export { router as routes };