import { Router } from 'express';
import { initiateLogin, handleCallback, verifyToken, refreshToken } from '../controllers';

const router = Router();

/**
 * Routes d'authentification Bungie
 * @route GET /auth/bungie/login - Initie le processus d'authentification Bungie
 * @route GET /auth/bungie/callback - Traite le callback d'autorisation Bungie
 * 
 * Note: Ces routes sont montées sous /auth, donc définies ici comme /bungie/...
 */
router.get('/bungie/login', initiateLogin);
router.get('/bungie/callback', handleCallback);

/**
 * Routes de gestion des tokens
 * @route POST /auth/verify - Vérifie la validité d'un token
 * @route POST /auth/refresh - Rafraîchit un token avant expiration
 * 
 * Note: Ces routes sont montées sous /auth, donc définies ici comme /verify et /refresh
 */
router.post('/verify', verifyToken);
router.post('/refresh', refreshToken);

/**
 * Routes utilitaires
 * @route GET /auth/status - Vérifie le statut du service d'authentification
 * 
 * Note: Cette route est montée sous /auth, donc définie ici comme /status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'online',
            timestamp: new Date().toISOString()
        },
        message: 'Authentication service is operational'
    });
});

export default router;