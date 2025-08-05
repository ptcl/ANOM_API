import { readFileSync } from 'fs';
import { join } from 'path';


export class AppInfoService {
    private static instance: AppInfoService;
    private packageInfo: any;
    private startTime: number;

    private constructor() {
        this.startTime = Date.now();
        try {
            const packagePath = join(process.cwd(), 'package.json');
            this.packageInfo = JSON.parse(readFileSync(packagePath, 'utf-8'));
        } catch (error) {
            console.warn('Impossible de lire le fichier package.json', error);
            this.packageInfo = {
                name: 'AN0M ARCHIVE API',
                version: process.env.npm_package_version,
                description: 'API pour l\'application AN0M ARCHIVE'
            };
        }
    }

    public static getInstance(): AppInfoService {
        if (!AppInfoService.instance) {
            AppInfoService.instance = new AppInfoService();
        }
        return AppInfoService.instance;
    }

    public getAppInfo() {
        return {
            name: this.packageInfo.name || 'AN0M ARCHIVE API',
            version: this.packageInfo.version || process.env.npm_package_version,
            description: this.packageInfo.description || 'API pour l\'application AN0M ARCHIVE',
            environment: process.env.NODE_ENV || 'development',
            uptime: this.getUptime()
        };
    }

    public getUptime(): string {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor(((uptime % 86400) % 3600) / 60);
        const seconds = Math.floor(((uptime % 86400) % 3600) % 60);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    public getVersion(): string {
        return this.packageInfo.version || process.env.npm_package_version;
    }

    public getName(): string {
        return this.packageInfo.name || 'AN0M ARCHIVE API';
    }
}
