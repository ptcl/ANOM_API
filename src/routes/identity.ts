import { Router } from 'express';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { AppInfoService } from '../services/appinfoservice';
import { handleCallback, initiateLogin, refreshToken, verifyToken } from '../controllers/identity.controller';
import { formatForUser } from '../utils';

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
            timestamp: formatForUser()
        }
    });
});

export default router;