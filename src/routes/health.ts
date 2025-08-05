import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { getMongoConfig, getServerConfig, isDev } from '../utils/environment';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { AppInfoService } from '../services/appInfoService';

const router = Router();

// Types pour les services
type DatabaseStatus = {
    connected: boolean;
    name: string;
    error?: string;
    responseTime?: number;
};

type ApiStatus = {
    status: string;
    responseTime?: number;
    error?: string;
};

type ServicesStatus = {
    database: DatabaseStatus;
    externalApis: {
        [key: string]: ApiStatus;
    };
};

router.get('/', async (req, res) => {
    const { uri, dbName } = getMongoConfig();
    const serverConfig = getServerConfig();
    const appInfoService = AppInfoService.getInstance();
    const appInfo = appInfoService.getAppInfo();

    const checkServices = async (): Promise<ServicesStatus> => {
        const result: ServicesStatus = {
            database: { connected: false, name: dbName },
            externalApis: {
                bungie: { status: 'unknown' }
            }
        };

        let client: MongoClient | null = null;
        try {
            const dbStartTime = Date.now();
            client = new MongoClient(uri);
            await client.connect();
            await client.db(dbName).command({ ping: 1 });
            const dbResponseTime = Date.now() - dbStartTime;

            result.database = {
                connected: true,
                name: dbName,
                responseTime: dbResponseTime
            };
        } catch (error: any) {
            result.database = {
                connected: false,
                name: dbName,
                error: error.message
            };
        } finally {
            if (client) await client.close();
        }

        try {
            result.externalApis.bungie = {
                status: 'ready',
                responseTime: 0
            };
        } catch (error: any) {
            result.externalApis.bungie = {
                status: 'error',
                error: error.message
            };
        }

        return result;
    };

    try {
        const services = await checkServices();

        const healthStatus = services.database.connected ? 'OK' : 'DEGRADED';

        if (services.database.connected) {
            return ApiResponseBuilder.success(res, {
                message: `${appInfo.name} fonctionne correctement`,
                data: {
                    status: healthStatus,
                    service: appInfo.name,
                    version: appInfo.version,
                    environment: appInfo.environment,
                    uptime: appInfo.uptime,
                    host: {
                        nodejs: process.version
                    },
                    server: {
                        port: serverConfig.port,
                        corsEnabled: true,
                        helmetEnabled: true
                    },
                    services: {
                        database: services.database,
                        externalApis: services.externalApis
                    }
                }
            });
        } else {
            return ApiResponseBuilder.error(res, 503, {
                message: `${appInfo.name} rencontre des problèmes`,
                error: 'service_degraded',
                details: {
                    status: healthStatus,
                    service: appInfo.name,
                    version: appInfo.version,
                    environment: appInfo.environment,
                    uptime: appInfo.uptime,
                    services: {
                        database: services.database,
                        externalApis: services.externalApis
                    }
                }
            });
        }
    } catch (error: any) {
        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur lors de la vérification de l\'état du service',
            error: 'internal_error',
            details: isDev() ? error.message : undefined
        });
    }
});

export default router;
