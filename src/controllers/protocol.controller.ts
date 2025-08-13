import { Request, Response } from 'express';
import { agentService } from '../services/agentservice';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { env } from '../utils/environment';

export const getProtocolStatus = async (req: Request, res: Response) => {
    try {
        const activeAgents = await agentService.getActiveAgentsCount();
        const appVersion = process.env.npm_package_version || '1.0.0';
        const environment = env.getEnvironment();
        const uptime = process.uptime();
        const formattedUptime = formatUptime(uptime);

        return ApiResponseBuilder.success(res, {
            message: 'Statut du système PROTOCOL',
            data: {
                status: 'ACTIVE',
                environment,
                activeAgents,
                systemVersion: appVersion,
                uptime: formattedUptime,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Error fetching protocol status:', error);
        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur lors de la récupération du statut du système',
            error: 'protocol_status_failed'
        });
    }
};

function formatUptime(uptime: number): string {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}