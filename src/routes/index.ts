import { Router } from 'express';
import authRoutes from './auth';
import destiny2Routes from './destiny2';
import protocolRoutes from './protocol';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Routes publiques
router.use('/auth', authRoutes);

// Routes protégées par authentification
router.use('/destiny2', authMiddleware, destiny2Routes);
router.use('/protocol', protocolRoutes);

// Route de statut API
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