import { env, getServerConfig } from './utils/environment';
import { connectDB, dbHealthCheck, closeDB } from './config/database';
import { connectMongoose, closeMongoose } from './config/mongoose';
import app from './app';

const startServer = async () => {
    try {
        console.log('🚀 Starting AN0M-ARCHIVES API...');

        env.logConfiguration();
        await connectDB();
        await connectMongoose();

        const isDbHealthy = await dbHealthCheck();
        if (!isDbHealthy) {
            throw new Error('Database health check failed');
        }

        const serverConfig = getServerConfig();

        const server = app.listen(serverConfig.port, () => {
            console.log(`
╔══════════════════════════════════════╗
║         AN0M ARCHIVE API             ║
║                                      ║
║  🚀 Server: http://localhost:${serverConfig.port.toString().padEnd(4)} ║
║  📊 Database: Connected              ║
║  🔐 Environment: ${env.getEnvironment().padEnd(11)} ║
║                                      ║
║  🔗 Health: api/health                  ║
║  � API Docs: /docs              ║
║  �📡 Auth: api/identity/bungie/login ║
╚══════════════════════════════════════╝
      `);
        });

        const gracefulShutdown = async (signal: string) => {
            console.log(`\n📴 ${signal} received, shutting down gracefully...`);

            server.close(async () => {
                console.log('🔒 HTTP server closed');

                try {
                    await closeMongoose();
                    await closeDB();
                    console.log('📴 Database connection closed');
                    console.log('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                console.error('⚠️  Forced shutdown after 10 seconds');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();