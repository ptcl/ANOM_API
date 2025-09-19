import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { env } from '../utils/environment';
import { formatForUser } from '../utils';

// Constantes de sécurité
const MAX_UPTIME_DAYS = 365;
const ALLOWED_ENVIRONMENTS = ['development', 'production', 'staging', 'test'] as const;
const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

// Fonction de validation de version
function sanitizeVersion(version: string | undefined): string {
    if (!version || typeof version !== 'string') {
        return '1.0.0';
    }

    // Nettoyage basique pour supprimer les caractères dangereux
    const cleaned = version.replace(/[^0-9.]/g, '');

    // Validation du format semver
    if (VERSION_REGEX.test(cleaned)) {
        return cleaned;
    }

    return '1.0.0';
}

export const getProtocolStatus = async (req: Request, res: Response) => {
    try {
        console.log('Protocol status request:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: formatForUser()
        });

        let activeAgents = 0;
        try {
            activeAgents = await agentService.getActiveAgentsCount();
        } catch (agentError: any) {
            console.warn('Failed to get active agents count:', {
                error: agentError.message,
                timestamp: formatForUser()
            });
        }

        const environment = env.getEnvironment();
        const sanitizedEnvironment = ALLOWED_ENVIRONMENTS.includes(environment as any) ? environment : 'unknown';

        const appVersion = sanitizeVersion(process.env.npm_package_version);

        const uptime = process.uptime();
        if (typeof uptime !== 'number' || uptime < 0) {
            throw new Error('Uptime invalide détecté');
        }

        const formattedUptime = formatUptime(uptime);

        if (typeof activeAgents !== 'number' || activeAgents < 0) {
            console.warn('Invalid active agents count detected:', activeAgents);
            activeAgents = 0;
        }

        return ApiResponseBuilder.success(res, {
            message: 'Statut du système PROTOCOL',
            data: {
                status: 'ACTIVE',
                environment: sanitizedEnvironment,
                activeAgents: Math.floor(activeAgents),
                systemVersion: appVersion,
                uptime: formattedUptime,
                timestamp: formatForUser(),
                region: process.env.AWS_REGION ? process.env.AWS_REGION.replace(/[^a-z0-9-]/g, '') : 'unknown'
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de la récupération du statut du protocole:', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur lors de la récupération du statut du système',
            error: 'protocol_status_failed'
        });
    }
};

function formatUptime(uptime: number): string {
    // Validation de sécurité de l'entrée
    if (typeof uptime !== 'number' || isNaN(uptime) || uptime < 0) {
        return '0s';
    }

    // Limitation pour éviter les valeurs excessives
    const maxUptime = MAX_UPTIME_DAYS * 24 * 60 * 60; // Limite configurable
    const safeUptime = Math.min(uptime, maxUptime);

    // Calculs sécurisés avec Math.floor pour éviter les décimales
    const days = Math.floor(safeUptime / 86400);
    const hours = Math.floor((safeUptime % 86400) / 3600);
    const minutes = Math.floor((safeUptime % 3600) / 60);
    const seconds = Math.floor(safeUptime % 60);

    // Validation des résultats
    if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
        return '0s';
    }

    // Construction sécurisée de la chaîne
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    // Limitation de la longueur de la réponse
    const result = parts.join(' ');
    return result.length > 50 ? '0s' : result;
}