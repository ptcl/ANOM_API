import { Router } from 'express';
import testRoutes from './test';
import authRoutes from './auth';

const router = Router();

// Test routes
router.use('/test', testRoutes);
router.use('/auth', authRoutes);
// API status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'AN0M API is running',
        timestamp: new Date().toISOString()
    });
});

export { router as routes };