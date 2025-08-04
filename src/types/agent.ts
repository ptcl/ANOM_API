export interface IAgent {
    _id?: any;
    bungieId: string;
    bungieTokens?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };
    rawdata?: any;
    protocol: {
        agentName: string;
        customName?: string;
        species: 'HUMAN' | 'EXO' | 'AWOKEN';
        role: 'AGENT' | 'SPECIALIST' | 'FOUNDER';
        clearanceLevel: number;
        hasSeenRecruitment: boolean;
        protocolJoinedAt?: Date;
        group?: 'PROTOCOL' | 'AURORA' | 'ZENITH';
        settings: {
            notifications: boolean;
            publicProfile: boolean;
            protocolOSTheme?: 'DEFAULT' | 'DARKNESS';
            protocolSounds?: boolean;
        }
    }
    lastActivity?: Date;
    createdAt: Date;
    updatedAt: Date;
}