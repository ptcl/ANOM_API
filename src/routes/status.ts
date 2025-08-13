import { Router, Request, Response } from 'express';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { AppInfoService } from '../services/appinfoservice';

const router = Router();
const appInfoService = AppInfoService.getInstance();

router.get('/', (req: Request, res: Response) => {
    const appInfo = appInfoService.getAppInfo();

    return ApiResponseBuilder.success(res, {
        message: `${appInfo.name} est opérationnel`,
        data: appInfo
    });
});

router.get('/version', (req: Request, res: Response) => {
    return ApiResponseBuilder.success(res, {
        message: 'Version de l\'API',
        data: {
            version: appInfoService.getVersion()
        }
    });
});

export default router;
