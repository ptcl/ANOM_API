// Interface pour le modèle Player
export interface Player {
    _id?: any;
    bungieId: string;
    displayName: string;
    membershipType: number;
    profilePicturePath?: string;
    role: string;
    bungieTokens: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };
    protocol: {
        agentName: string;
        customName?: string;
        species: 'HUMAN' | 'EXO' | 'AWOKEN';
        clearanceLevel: number;
        hasSeenRecruitment: boolean;
        protocolJoinedAt?: Date;
        group?: string;
        projectAccess?: {
            ANOM: boolean;
            AURORA: boolean;
            ZENITH: boolean;
        };
    };
    joinedAt: Date;
    lastActivity: Date;
    settings: {
        notifications: boolean;
        publicProfile: boolean;
        protocolOSTheme: string;
        protocolSounds: boolean;
    };
}
