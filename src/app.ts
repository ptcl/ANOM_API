import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { getMongoConfig, getServerConfig, isDev } from './utils/environment';
import { routes } from './routes';
import { swaggerSpec } from './config/swagger';
// Import de la documentation
import './docs';
import { MongoClient } from 'mongodb';

const createApp = (): express.Application => {
    const app = express();
    const serverConfig = getServerConfig();

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

    app.use(cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://ladybird-helping-blindly.ngrok-free.app',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true
    }));
    // app.use(cors({
    //     origin: serverConfig.corsOrigins,
    //     credentials: true,
    //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    //     allowedHeaders: [
    //         'Origin',
    //         'X-Requested-With',
    //         'Content-Type',
    //         'Accept',
    //         'Authorization',
    //         'X-API-Key'
    //     ]
    // }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        if (isDev()) {
            console.log(`${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`);
        } else {
            console.log(`${req.method} ${req.url}`);
        }
        next();
    });

    app.use('/api', routes);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Protocol API Documentation',
    }));

    app.use('/api/*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found',
            message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
            timestamp: new Date().toISOString()
        });
    });

    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'Resource not found',
            message: `The resource ${req.originalUrl} does not exist`,
            timestamp: new Date().toISOString()
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
            timestamp: new Date().toISOString()
        });
    });

    return app;
};

export default createApp();
