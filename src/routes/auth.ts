import { Router } from 'express';
import { initiateLogin, handleCallback, verifyToken, getProfile, refreshToken } from '../controllers';

const router = Router();

// Initie l'authentification Bungie
router.get('/bungie/login', initiateLogin);

// Callback d'autorisation Bungie
router.get('/bungie/callback', handleCallback);

// Vérification de token
router.post('/verify-token', verifyToken);

// Rafraîchissement de token
router.post('/refresh-token', refreshToken);

// Profil du joueur connecté
router.get('/profile', getProfile);

// Status de l'auth
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            bungie_configured: !!(process.env.BUNGIE_API_KEY && process.env.BUNGIE_CLIENT_ID),
            jwt_configured: !!process.env.JWT_SECRET
        },
        message: 'Auth service status'
    });
});

export default router;