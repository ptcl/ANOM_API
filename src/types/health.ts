export interface IDatabaseStatus {
    connected: boolean;
    name: string;
    error?: string;
    responseTime?: number;
};

export interface IApiStatus {
    status: string;
    responseTime?: number;
    error?: string;
};

export interface IServicesStatus {
    database: IDatabaseStatus;
    externalApis: {
        [key: string]: IApiStatus;
    };
}