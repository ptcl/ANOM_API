import { Router } from 'express';
import { initiateLogin, handleCallback, verifyToken, refreshToken } from '../controllers';

const router = Router();


router.get('/bungie/login', initiateLogin);
router.get('/bungie/callback', handleCallback);

router.post('/verify', verifyToken);
router.post('/refresh', refreshToken);

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