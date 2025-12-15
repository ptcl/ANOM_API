import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

export type Environment = 'development' | 'production' | 'sandbox';

class EnvironmentManager {
    private static instance: EnvironmentManager;
    private env: Environment;

    private constructor() {
        const nodeEnv = process.env.NODE_ENV as Environment;
        if (!['development', 'production', 'sandbox'].includes(nodeEnv)) {
            logger.warn(`Unknown NODE_ENV="${process.env.NODE_ENV}", defaulting to "development"`);
            this.env = 'development';
        } else {
            this.env = nodeEnv;
        }
        this.validateEnvironment();
    }

    public static getInstance(): EnvironmentManager {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }

    private validateEnvironment(): void {
        logger.info(`Environment: ${this.env}`);

        const requiredVars = [
            'JWT_SECRET',
            'BUNGIE_API_KEY',
            'BUNGIE_CLIENT_ID',
            'BUNGIE_CLIENT_SECRET',
            'BUNGIE_REDIRECT_URI',
            'MONGO_URL'
        ];

        if (this.isProduction()) {
            requiredVars.push('CORS_ORIGINS');
        }

        const missing = requiredVars.filter(v => !process.env[v]);
        if (missing.length > 0) {
            logger.error('Missing env variables:');
            missing.forEach(v => logger.error(`   - ${v}`));
            if (this.isProduction()) process.exit(1);
        } else {
            logger.info('Env check passed');
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
    getMongoConfig(): { uri: string; dbName: string } {
        const uri = process.env.MONGO_URL || '';
        const dbName = this.env;
        return { uri, dbName };
    }

    getServerConfig() {
        const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
        let corsOrigins = defaultOrigins;

        if (process.env.CORS_ORIGINS) {
            corsOrigins = process.env.CORS_ORIGINS
                .split(',')
                .map(origin => origin.trim())
                .filter(o => {
                    try {
                        new URL(o);
                        return true;
                    } catch {
                        logger.warn(`Invalid CORS origin ignored: ${o}`);
                        return false;
                    }
                });
        }

        if (corsOrigins.length === 0) corsOrigins = defaultOrigins;

        return {
            port: parseInt(process.env.PORT || '3031', 10),
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3031',
            cookieDomain: process.env.COOKIE_DOMAIN || undefined,
            corsOrigins: corsOrigins.map(o => o.replace(/\/$/, ''))
        };
    }

    isDevelopment() { return this.env === 'development'; }
    isProduction() { return this.env === 'production'; }
    isSandbox() { return this.env === 'sandbox'; }
    getEnvironment() { return this.env; }
}

const environmentManager = EnvironmentManager.getInstance();
export const isLocalhost = () => {
    const host = process.env.FRONTEND_URL || ''
    return host.includes('localhost') || host.includes('127.0.0.1')
}
export const env = environmentManager;
export const isDev = () => environmentManager.isDevelopment();
export const isProd = () => environmentManager.isProduction();
export const isSandbox = () => environmentManager.isSandbox();
export const getMongoConfig = () => environmentManager.getMongoConfig();
export const getServerConfig = () => environmentManager.getServerConfig();
export const getBungieConfig = () => environmentManager.getBungieConfig();
