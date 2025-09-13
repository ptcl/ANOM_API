export { IAgentService } from '../services/agentservice';
export { IAppInfoService } from '../services/appinfoservice';

export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions extends PaginationOptions {
    query?: string;
    filters?: Record<string, any>;
}

export interface AgentServiceStats {
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
    recentJoins: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

export interface AuditLogEntry {
    timestamp: Date;
    action: string;
    agentId?: string;
    details: Record<string, any>;
    ip?: string;
    userAgent?: string;
}
export interface AppInfo {
    name: string;
    version: string;
    description: string;
    environment: string;
    uptime: string;
    startTime: string;
}

export interface SafePackageInfo {
    name?: string;
    version?: string;
    description?: string;
}

export interface SystemInfo {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
        total: string;
        used: string;
        free: string;
    };
    pid: number;
}