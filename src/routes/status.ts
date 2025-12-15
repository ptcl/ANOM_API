import { Router, Request, Response } from 'express';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { AppInfoService } from '../services/appinfo.service';

const router = Router();
const appInfoService = AppInfoService.getInstance();

router.get('/json', (req: Request, res: Response) => {
    const appInfo = appInfoService.getAppInfo();
    return ApiResponseBuilder.success(res, {
        message: `${appInfo.name} is online`,
        data: {
            name: appInfo.name,
            version: appInfo.version,
            status: 'operational',
            uptime: appInfo.uptime
        }
    });
});

router.get('/', (req: Request, res: Response) => {
    const appInfo = appInfoService.getAppInfo();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appInfo.name} - Status</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
            background: #000;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { text-align: left; }
        h1 { font-size: 20px; font-weight: 400; margin-bottom: 8px; }
        .version { color: #666; font-size: 16px; margin-bottom: 32px; }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 32px;
        }
        .dot {
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
        }
        .text__title { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .text { font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
        .uptime { color: #666; font-size: 12px; margin-bottom: 32px; }

        .links {
         display:flex;
         gap: 12px;
        }
        .links a {
            color: #666;
            text-decoration: none;
            font-size: 12px;
        }
        .links a:hover { color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text__title">${appInfo.name}</h1>
        <p class="version">v${appInfo.version}</p>
        <div class="status">
            <span class="dot"></span>
            <span class="text">Operational</span>
        </div>
        <p class="uptime">Uptime: ${appInfo.uptime}</p>
        <div class="links">
            <a href="/docs">Docs EN</a>
            <a href="/docs/fr">Docs FR</a>
        </div>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

export default router;
