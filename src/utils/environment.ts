import dotenv from 'dotenv';
dotenv.config();

export type Environment = 'development' | 'production' | 'test';

class EnvironmentManager {
    private static instance: EnvironmentManager;
    private env: Environment;

    private constructor() {
        this.env = (process.env.NODE_ENV as Environment) || 'development';
        this.validateEnvironment();
    }

    public static getInstance(): EnvironmentManager {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }

    private validateEnvironment(): void {
        console.log(`🌍 Environment: ${this.env}`);

        const requiredVars = [
            'JWT_SECRET',
            'BUNGIE_API_KEY',
            'BUNGIE_CLIENT_ID',
            'BUNGIE_CLIENT_SECRET',
            'BUNGIE_REDIRECT_URI'
        ];

        if (this.isDevelopment()) {
            requiredVars.push('MONGO_URL', 'MONGO_DB_NAME_DEV');
        } else if (this.isProduction()) {
            requiredVars.push('MONGO_URL_PROD', 'MONGO_DB_NAME_PROD');
        }

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Missing required environment variables:');
            missingVars.forEach(varName => {
                console.error(`   - ${varName}`);
            });

            if (this.isProduction()) {
                console.error('🚫 Exiting due to missing environment variables in production');
                process.exit(1);
            } else {
                console.warn('⚠️  Continuing in development mode, but some features may not work');
            }
        } else {
            console.log('✅ All required environment variables are present');
        }
    }

    getMongoConfig(): { uri: string; dbName: string } {
        if (this.isProduction()) {
            return {
                uri: process.env.MONGO_URL_PROD!,
                dbName: process.env.MONGO_DB_NAME_PROD!
            };
        } else {
            return {
                uri: process.env.MONGO_URL!,
                dbName: process.env.MONGO_DB_NAME_DEV!
            };
        }
    }

    getBungieConfig() {
        return {
            apiKey: process.env.BUNGIE_API_KEY!,
            clientId: process.env.BUNGIE_CLIENT_ID!,
            clientSecret: process.env.BUNGIE_CLIENT_SECRET!,
            redirectUri: process.env.BUNGIE_REDIRECT_URI!
        };
    }

    getJWTConfig() {
        return {
            secret: process.env.JWT_SECRET!,
        };
    }

    getServerConfig() {
        return {
            port: parseInt(process.env.PORT || '3000', 10),
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
            corsOrigins: this.isProduction()
                ? process.env.FRONTEND_URL?.split(',') || []
                : ['http://localhost:3000', 'http://localhost:3001']
        };
    }


    isDevelopment(): boolean {
        return this.env === 'development';
    }

    isProduction(): boolean {
        return this.env === 'production';
    }

    isTesting(): boolean {
        return this.env === 'test';
    }

    getEnvironment(): Environment {
        return this.env;
    }

    logConfiguration(): void {
        const mongoConfig = this.getMongoConfig();
        const serverConfig = this.getServerConfig();

        console.log(`
╔══════════════════════════════════════╗
║         CONFIGURATION                ║
║                                      ║
║  🌍 Environment: ${this.env.padEnd(11)} ║
║  📊 Database: ${mongoConfig.dbName.padEnd(15)} ║
║  🚀 Port: ${serverConfig.port.toString().padEnd(19)} ║
║  🔐 Bungie: ${process.env.BUNGIE_API_KEY ? 'Configured' : 'Missing'.padEnd(10)} ║
║  🎯 Frontend: ${serverConfig.frontendUrl.length > 20 ? 'Configured' : serverConfig.frontendUrl.padEnd(11)} ║
╚══════════════════════════════════════╝
    `);
    }
}

const environmentManager = EnvironmentManager.getInstance();

export const env = environmentManager;
export const isDev = () => environmentManager.isDevelopment();
export const isProd = () => environmentManager.isProduction();
export const getMongoConfig = () => environmentManager.getMongoConfig();
export const getBungieConfig = () => environmentManager.getBungieConfig();
export const getJWTConfig = () => environmentManager.getJWTConfig();
export const getServerConfig = () => environmentManager.getServerConfig();