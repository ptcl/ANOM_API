import { Router } from 'express';
import { initiateLogin, handleCallback, verifyToken, refreshToken } from '../controllers';

const router = Router();

// Initie l'authentification Bungie
router.get('/bungie/login', initiateLogin);

// Callback d'autorisation Bungie
router.get('/bungie/callback', handleCallback);

// Vérification de token
router.post('/verify-token', verifyToken);

// Rafraîchissement de token
router.post('/refresh-token', refreshToken);

// Status de l'auth
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Auth service status'
    });
});

export default router;