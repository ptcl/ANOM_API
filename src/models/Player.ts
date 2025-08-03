import { ObjectId } from 'mongodb';

export interface Player {
    _id?: ObjectId;
    bungieId: string;
    displayName: string;
    membershipType: number;
    profilePicturePath?: string;
    role: 'agent' | 'specialist' | 'founder';

    // OAuth tokens
    bungieTokens?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };

    protocol?: {
        agentName: string;
        customName?: string;
        species: 'HUMAN' | 'EXO' | 'AWOKEN';
        clearanceLevel: 1 | 2 | 3;
        hasSeenRecruitment: boolean;
        protocolJoinedAt?: Date;
        group?: 'PROTOCOL' | 'AURORA' | 'ZENITH' | 'EXODUS' | 'GUARDIAN' | 'INDEPENDENT';
        projectAccess?: {
            ANOM: boolean;
            AURORA: boolean;
            ZENITH: boolean;
        };
    };
    // Timestamps
    joinedAt: Date;
    lastActivity: Date;

    // Settings
    settings?: {
        notifications: boolean;
        publicProfile: boolean;
        protocolOSTheme?: 'default' | 'classic';
        protocolSounds?: boolean;
    };

}