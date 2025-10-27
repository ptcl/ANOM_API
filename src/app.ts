import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { isDev, getServerConfig } from './utils/environment';
import { swaggerSpec } from './config/swagger';
import './docs';
import { routes } from './routes/index';
import rateLimit from 'express-rate-limit';
import { formatForUser } from './utils';
import cookieParser from 'cookie-parser';


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Vous avez dépassé la limite de requêtes, réessayez plus tard.'
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

    app.use((req, res, next) => {
        const timestamp = formatForUser()
        if (isDev()) {
            console.log(`${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`);
        } else {
            console.log(`${req.method} ${req.url}`);
        }
        next();
    });
    // app.use(limiter);
    app.use('/api', routes);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Protocol API Documentation',
    }));

    app.use((req, res, next) => {
        if (req.path.startsWith('/api/')) {
            res.status(404).json({
                success: false,
                error: 'API endpoint not found',
                message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
                timestamp: formatForUser()
            });
        } else {
            next();
        }
    });

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Resource not found',
            message: `The resource ${req.originalUrl} does not exist`,
            timestamp: formatForUser()
        });
    });

    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('❌ Global error:', error);

        if (isDev()) {
            console.error('Stack:', error.stack);
        }

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
