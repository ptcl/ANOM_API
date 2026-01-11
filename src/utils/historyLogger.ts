import fs from 'fs';
import path from 'path';

const LOGS_BASE_DIR = path.join(process.cwd(), 'logs', 'agents');
const RETENTION_DAYS = 730; // 2 years

interface HistoryLogEntry {
    action: string;
    targetId?: string;
    timestamp: Date;
    success?: boolean;
    meta?: Record<string, any>;
}

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getLogFilePath(bungieId: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `${year}-${month}.log`;

    const agentDir = path.join(LOGS_BASE_DIR, bungieId);
    ensureDirectoryExists(agentDir);

    return path.join(agentDir, fileName);
}

export async function logToAgentFile(
    bungieId: string,
    entry: HistoryLogEntry
): Promise<void> {
    try {
        const filePath = getLogFilePath(bungieId);
        const logLine = JSON.stringify({
            ...entry,
            timestamp: entry.timestamp.toISOString()
        }) + '\n';

        fs.appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
        console.error(`Failed to write history log for agent ${bungieId}:`, error);
    }
}

export async function cleanOldLogs(): Promise<void> {
    try {
        if (!fs.existsSync(LOGS_BASE_DIR)) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        const agentDirs = fs.readdirSync(LOGS_BASE_DIR);

        for (const agentDir of agentDirs) {
            const agentPath = path.join(LOGS_BASE_DIR, agentDir);
            if (!fs.statSync(agentPath).isDirectory()) continue;

            const logFiles = fs.readdirSync(agentPath);

            for (const logFile of logFiles) {
                if (!logFile.endsWith('.log')) continue;

                // Parse YYYY-MM from filename
                const match = logFile.match(/^(\d{4})-(\d{2})\.log$/);
                if (!match) continue;

                const fileDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1);

                if (fileDate < cutoffDate) {
                    const filePath = path.join(agentPath, logFile);
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old log file: ${filePath}`);
                }
            }

            // Remove empty agent directories
            const remainingFiles = fs.readdirSync(agentPath);
            if (remainingFiles.length === 0) {
                fs.rmdirSync(agentPath);
            }
        }
    } catch (error) {
        console.error('Failed to clean old logs:', error);
    }
}

export async function getAgentLogFiles(bungieId: string): Promise<string[]> {
    const agentDir = path.join(LOGS_BASE_DIR, bungieId);

    if (!fs.existsSync(agentDir)) return [];

    return fs.readdirSync(agentDir)
        .filter(f => f.endsWith('.log'))
        .sort()
        .reverse();
}
