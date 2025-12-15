import { Request, Response } from 'express';
import { agentService } from '../services/agent.service';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { env } from '../utils/environment';
import { logger } from '../utils';

const MAX_UPTIME_DAYS = 365;
const ALLOWED_ENVIRONMENTS = ['development', 'production', 'staging', 'test'] as const;
const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

function sanitizeVersion(version: string | undefined): string {
    if (!version || typeof version !== 'string') {
        return '1.0.0';
    }

    const cleaned = version.replace(/[^0-9.]/g, '');

    if (VERSION_REGEX.test(cleaned)) {
        return cleaned;
    }

    return '1.0.0';
}

export const getProtocolStatus = async (req: Request, res: Response) => {
    try {
        logger.info('Protocol status request:', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        let activeAgents = 0;
        try {
            activeAgents = await agentService.getActiveAgentsCount();
        } catch (agentError: any) {
            logger.warn('Failed to get active agents count:', {
                error: agentError.message
            });
        }

        const environment = env.getEnvironment();
        const sanitizedEnvironment = ALLOWED_ENVIRONMENTS.includes(environment as any) ? environment : 'unknown';

        const appVersion = sanitizeVersion(process.env.npm_package_version);

        const uptime = process.uptime();
        if (typeof uptime !== 'number' || uptime < 0) {
            throw new Error('Invalid uptime detected');
        }

        const formattedUptime = formatUptime(uptime);

        if (typeof activeAgents !== 'number' || activeAgents < 0) {
            logger.warn('Invalid active agents count detected:', activeAgents);
            activeAgents = 0;
        }

        return ApiResponseBuilder.success(res, {
            message: 'Protocol system status retrieved successfully',
            data: {
                status: 'ACTIVE',
                environment: sanitizedEnvironment,
                activeAgents: Math.floor(activeAgents),
                systemVersion: appVersion,
                uptime: formattedUptime,
                region: process.env.AWS_REGION ? process.env.AWS_REGION.replace(/[^a-z0-9-]/g, '') : 'unknown'
            }
        });

    } catch (error: any) {
        logger.error('Error retrieving protocol status', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Error retrieving protocol status',
            error: 'protocol_status_failed'
        });
    }
};

function formatUptime(uptime: number): string {
    if (typeof uptime !== 'number' || isNaN(uptime) || uptime < 0) {
        return '0s';
    }

    const maxUptime = MAX_UPTIME_DAYS * 24 * 60 * 60;
    const safeUptime = Math.min(uptime, maxUptime);

    const days = Math.floor(safeUptime / 86400);
    const hours = Math.floor((safeUptime % 86400) / 3600);
    const minutes = Math.floor((safeUptime % 3600) / 60);
    const seconds = Math.floor(safeUptime % 60);

    if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
        return '0s';
    }

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    const result = parts.join(' ');
    return result.length > 50 ? '0s' : result;
}