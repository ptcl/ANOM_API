import { Router } from 'express';
import testRoutes from './test';
import authRoutes from './auth';
import userRoutes from './user';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Test routes
router.use('/test', testRoutes);
router.use('/auth', authRoutes);
router.use('/user', authMiddleware, userRoutes);
// API status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'AN0M API is running',
        timestamp: new Date().toISOString()
    });
});

export { router as routes };