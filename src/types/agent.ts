export interface IAgent {
    _id?: any;
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
    createdAt: Date;
    updatedAt: Date;
}