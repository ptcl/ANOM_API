import { Router } from 'express';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { AppInfoService } from '../services/appinfoservice';
import { handleCallback, initiateLogin, logout, refreshToken, verifyAuth, verifyToken } from '../controllers/identity.controller';
import { formatForUser } from '../utils';

const router = Router();


router.get('/bungie/login', initiateLogin);
router.get('/bungie/callback', handleCallback);
router.get('/auth/verify', verifyAuth);
router.post('/auth/logout', logout);
// router.post('/auth/token/verify', verifyToken);
router.post('/auth/refresh', refreshToken);

router.get('/status', (req, res) => {
    const appInfoService = AppInfoService.getInstance();

    return ApiResponseBuilder.success(res, {
        message: 'Service d\'authentification opérationnel',
        data: {
            status: 'online',
            service: 'Authentication',
            version: appInfoService.getVersion(),
            timestamp: formatForUser()
        }
    });
});

export default router;