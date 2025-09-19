import { readFileSync } from 'fs';
import { join } from 'path';
import { AppInfo, SafePackageInfo, SystemInfo } from '../types/services';
import { formatForLog, formatForApi, formatForUser } from '../utils/dateformat';

export interface IAppInfoService {
    getAppInfo(): AppInfo;
    getUptime(): string;
    getVersion(): string;
    getName(): string;
    getEnvironment(): string;
    isProduction(): boolean;
    getUptimeInSeconds(): number;
    getStartTime(): Date;
    getSystemInfo(): SystemInfo;
}

// Constantes de sécurité
const MAX_UPTIME_DAYS = 365;
const ALLOWED_ENVIRONMENTS = ['development', 'production', 'staging', 'test'] as const;
const DEFAULT_APP_NAME = 'AN0M-ARCHIVES API';
const DEFAULT_VERSION = '1.0.0';
const DEFAULT_DESCRIPTION = 'API pour l\'application AN0M-ARCHIVES';

export class AppInfoService implements IAppInfoService {
    private static instance: AppInfoService;
    private readonly packageInfo: SafePackageInfo;
    private readonly startTime: number;
    private readonly startDate: Date;

    private constructor() {
        this.startTime = Date.now();
        this.startDate = new Date();
        this.packageInfo = this.loadPackageInfoSecurely();
    }

    private loadPackageInfoSecurely(): SafePackageInfo {
        try {
            const packagePath = join(process.cwd(), 'package.json');

            if (!packagePath.startsWith(process.cwd())) {
                throw new Error('Chemin de package.json invalide');
            }

            const packageContent = readFileSync(packagePath, 'utf-8');

            if (packageContent.length > 100000) {
                throw new Error('Fichier package.json trop volumineux');
            }

            const rawPackageInfo = JSON.parse(packageContent);

            const safePackageInfo: SafePackageInfo = {
                name: this.sanitizeString(rawPackageInfo.name),
                version: this.sanitizeVersion(rawPackageInfo.version),
                description: this.sanitizeString(rawPackageInfo.description)
            };

            console.log('Package.json chargé avec succès:', {
                name: safePackageInfo.name,
                version: safePackageInfo.version,
                timestamp: formatForUser()
            });

            return safePackageInfo;

        } catch (error: any) {
            console.warn('Impossible de lire le fichier package.json de manière sécurisée:', {
                error: error.message,
                timestamp: formatForUser()
            });

            // Fallback sécurisé
            return {
                name: DEFAULT_APP_NAME,
                version: this.sanitizeVersion(process.env.npm_package_version) || DEFAULT_VERSION,
                description: DEFAULT_DESCRIPTION
            };
        }
    }

    private sanitizeString(value: any, maxLength: number = 200): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        const safeMaxLength = Math.min(Math.max(maxLength, 1), 1000);

        const sanitized = value
            .replace(/[<>\"'&]/g, '')
            .trim()
            .slice(0, safeMaxLength);

        return sanitized.length > 0 ? sanitized : undefined;
    }

    private sanitizeVersion(value: any): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        const versionRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9.-]+)?$/;
        const cleaned = value.trim();

        if (versionRegex.test(cleaned) && cleaned.length <= 20) {
            return cleaned;
        }

        return undefined;
    }

    private sanitizeNodeVersion(value: any): string {
        if (typeof value !== 'string') {
            return 'unknown';
        }

        const nodeVersionRegex = /^v?(\d+)\.(\d+)\.(\d+)$/;
        const cleaned = value.trim();

        if (nodeVersionRegex.test(cleaned) && cleaned.length <= 20) {
            return cleaned;
        }

        return 'unknown';
    }

    private getValidatedEnvironment(): string {
        const env = process.env.NODE_ENV?.toLowerCase().trim();

        if (env && ALLOWED_ENVIRONMENTS.includes(env as any)) {
            return env;
        }

        return 'development';
    }

    public static getInstance(): IAppInfoService {
        if (!AppInfoService.instance) {
            try {
                AppInfoService.instance = new AppInfoService();
                console.log('AppInfoService initialisé avec succès:', {
                    timestamp: formatForUser()
                });
            } catch (error: any) {
                console.error('Erreur lors de l\'initialisation d\'AppInfoService:', {
                    error: error.message,
                    timestamp: formatForUser()
                });
                throw new Error('Impossible d\'initialiser AppInfoService');
            }
        }
        return AppInfoService.instance;
    }

    public static resetInstance(): void {
        AppInfoService.instance = null as any;
    }

    public getAppInfo(): AppInfo {
        return {
            name: this.getName(),
            version: this.getVersion(),
            description: this.packageInfo.description || DEFAULT_DESCRIPTION,
            environment: this.getEnvironment(),
            uptime: this.getUptime(),
            startTime: formatForApi(this.startDate)
        };
    }

    public getUptime(): string {
        try {
            const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

            if (uptimeSeconds < 0) {
                console.warn('Uptime négatif détecté, réinitialisation');
                return '0s';
            }

            if (uptimeSeconds > MAX_UPTIME_DAYS * 24 * 60 * 60) {
                console.warn('Uptime excessif détecté, limitation appliquée');
                return `${MAX_UPTIME_DAYS}d+`;
            }

            const days = Math.floor(uptimeSeconds / 86400);
            const hours = Math.floor((uptimeSeconds % 86400) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = Math.floor(uptimeSeconds % 60);

            const parts: string[] = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

            return parts.join(' ');

        } catch (error: any) {
            console.error('Erreur lors du calcul de l\'uptime:', {
                error: error.message,
                timestamp: formatForUser()
            });
            return '0s';
        }
    }

    public getVersion(): string {
        return this.packageInfo.version ||
            this.sanitizeVersion(process.env.npm_package_version) ||
            DEFAULT_VERSION;
    }

    public getName(): string {
        return this.packageInfo.name || DEFAULT_APP_NAME;
    }

    public getEnvironment(): string {
        return this.getValidatedEnvironment();
    }

    public isProduction(): boolean {
        return this.getEnvironment() === 'production';
    }

    public getUptimeInSeconds(): number {
        return Math.floor(process.uptime());
    }

    public getStartTime(): Date {
        const uptimeMs = process.uptime() * 1000;
        return new Date(Date.now() - uptimeMs);
    }

    public getSystemInfo(): SystemInfo {
        const memUsage = process.memoryUsage();

        return {
            nodeVersion: this.sanitizeNodeVersion(process.version),
            platform: this.sanitizeString(process.platform) || 'unknown',
            arch: this.sanitizeString(process.arch) || 'unknown',
            memory: {
                total: this.formatBytes(memUsage.heapTotal),
                used: this.formatBytes(memUsage.heapUsed),
                free: this.formatBytes(memUsage.heapTotal - memUsage.heapUsed)
            },
            pid: process.pid
        };
    }

    private formatBytes(bytes: number): string {
        if (!Number.isFinite(bytes) || bytes < 0) {
            return '0 Bytes';
        }

        const maxBytes = Number.MAX_SAFE_INTEGER;
        if (bytes > maxBytes) {
            return 'Too large';
        }

        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        const safeIndex = Math.min(i, sizes.length - 1);

        const value = bytes / Math.pow(k, safeIndex);
        const formattedValue = Math.round(value * 100) / 100;

        return `${formattedValue} ${sizes[safeIndex]}`;
    }
}

export const appInfoService: IAppInfoService = AppInfoService.getInstance();
