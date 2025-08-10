import { Router } from 'express';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { AppInfoService } from '../services/appInfoService';
import { handleCallback, initiateLogin, refreshToken, verifyToken } from '../controllers/Identity.controller';

const router = Router();


router.get('/bungie/login', initiateLogin);
router.get('/bungie/callback', handleCallback);

router.post('/verify', verifyToken);
router.post('/refresh', refreshToken);

router.get('/status', (req, res) => {
    const appInfoService = AppInfoService.getInstance();

    return ApiResponseBuilder.success(res, {
        message: 'Service d\'authentification opérationnel',
        data: {
            status: 'online',
            service: 'Authentication',
            version: appInfoService.getVersion(),
            timestamp: new Date().toISOString()
        }
    });
});

export default router;