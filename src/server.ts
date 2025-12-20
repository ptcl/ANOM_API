import { getServerConfig } from './utils/environment';
import { connectDB, dbHealthCheck, closeDB } from './config/database';
import { connectMongoose, closeMongoose } from './config/mongoose';
import { seedSystemRoles } from './services/role.service';
import { seedSystemDivisions } from './services/division.service';
import { seedSystemThemes } from './models/settings.model';
import app from './app';
import logger from './utils/logger';

const startServer = async () => {
    try {
        logger.info('Starting AN0M-ARCHIVES API...');

        await connectDB();
        await connectMongoose();

        const isDbHealthy = await dbHealthCheck();
        if (!isDbHealthy) {
            throw new Error('Database health check failed');
        }

        await seedSystemRoles();
        await seedSystemDivisions();
        await seedSystemThemes();

        const serverConfig = getServerConfig();

        const server = app.listen(serverConfig.port, () => {
            logger.info(`Server started`, {
                port: serverConfig.port,
                env: process.env.NODE_ENV || 'development'
            });
        });

        const gracefulShutdown = async (signal: string) => {
            logger.warn(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await closeMongoose();
                    await closeDB();
                    logger.info('Database connections closed');
                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (error: any) {
                    logger.error('Error during shutdown', { error: error.message });
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Forced shutdown after 10 seconds');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason: any, promise) => {
            logger.error('Unhandled Rejection', { reason: reason?.message || reason });
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error: any) {
        logger.error('Failed to start server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

startServer();
