import { Router } from 'express';
import testRoutes from './test';
import authRoutes from './auth';
import userRoutes from './user';
import destiny2Routes from './destiny2';
import protocolRoutes from './protocol';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * Configuration des routes API
 * La structure suit trois modèles principaux:
 * 
 * 1. Routes standard: 
 *    /api/{service}/{resource}
 * 
 * 2. Routes style Bungie pour Destiny2: 
 *    /api/destiny2/{membershipType}/Profile/{membershipId}/...
 * 
 * 3. Routes de Protocol avec identifiants Bungie:
 *    /api/protocol/{membershipType}/{membershipId}/...
 */

// Routes publiques
router.use('/test', testRoutes);
router.use('/auth', authRoutes);

// Routes protégées par authentification
router.use('/user', authMiddleware, userRoutes);
router.use('/destiny2', destiny2Routes);
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