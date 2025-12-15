import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const HttpLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;
        const userAgent = req.get('User-Agent') || 'unknown';
        const userId = (req as any).user?.agentId || 'anonymous';

        const logData = {
            method,
            url: originalUrl,
            status: statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent: userAgent.substring(0, 100),
            userId,
        };

        if (statusCode >= 500) {
            logger.error('HTTP Request Failed', logData);
        } else if (statusCode >= 400) {
            logger.warn('HTTP Request Client Error', logData);
        } else {
            logger.http(`${method} ${originalUrl} ${statusCode} ${duration}ms`, { ip, userId });
        }
    });

    next();
};

export default HttpLoggerMiddleware;
