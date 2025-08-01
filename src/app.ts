import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getServerConfig, isDev } from './utils/environment';
import { routes } from './routes';

const createApp = (): express.Application => {
    const app = express();
    const serverConfig = getServerConfig();

    // Security middleware
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
        origin: 'https://ladybird-helping-blindly.ngrok-free.app',
        credentials: true
    }))
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
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logger (plus détaillé en dev)
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        if (isDev()) {
            console.log(`${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`);
        } else {
            console.log(`${req.method} ${req.url}`);
        }
        next();
    });

    // Health check avec info environnement
    app.get('/health', (req, res) => {
        const mongoConfig = require('./utils/environment').getMongoConfig();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'AN0M ARCHIVE API',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: {
                name: mongoConfig.dbName,
                connected: true // TODO: vérifier vraiment la connexion
            }
        });
    });

    // API Routes
    app.use('/api', routes);

    // 404 handler
    app.use('/api/*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found',
            message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
            timestamp: new Date().toISOString()
        });
    });

    // Catch all other 404s
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'Resource not found',
            message: `The resource ${req.originalUrl} does not exist`,
            timestamp: new Date().toISOString()
        });
    });

    // Global error handler
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('❌ Global error:', error);

        // Log plus détaillé en dev
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