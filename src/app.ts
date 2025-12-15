import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isDev, isSandbox, getServerConfig } from './utils/environment';
import { routes } from './routes/index';
import docsRoutes from './routes/docs.routes';
import rateLimit from 'express-rate-limit';
import { formatForUser } from './utils';
import cookieParser from 'cookie-parser';
import { HttpLoggerMiddleware } from './middlewares/httpLogger.middleware';
import logger from './utils/logger';


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev() ? 1000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Too many requests, please try again later.'
    }
});

const createApp = (): express.Application => {
    const app = express();
    const serverConfig = getServerConfig();

    app.set('trust proxy', 1);
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:", "*.bungie.net"],
                connectSrc: ["'self'", "*.bungie.net"],
            },
        },
        crossOriginEmbedderPolicy: false
    }));
    app.use(cookieParser());
    app.use(cors({
        origin: serverConfig.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key',
            'ngrok-skip-browser-warning'
        ],
        optionsSuccessStatus: 200,
        maxAge: 86400
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(HttpLoggerMiddleware);
    if (!isSandbox()) {
        app.use(limiter);
    }

    app.use('/api', routes);
    app.use('/docs', docsRoutes);

    app.use((req, res) => {
        const isApi = req.path.startsWith('/api/');
        res.status(404).json({
            success: false,
            error: isApi ? 'API endpoint not found' : 'Resource not found',
            message: isApi
                ? `The endpoint ${req.method} ${req.originalUrl} does not exist`
                : `The resource ${req.originalUrl} does not exist`,
            timestamp: formatForUser()
        });
    });

    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error('Global error', {
            error: error.message,
            stack: isDev() ? error.stack : undefined,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            ...(isDev() && { details: error.message }),
            timestamp: formatForUser()
        });
    });

    return app;
};

export default createApp();
