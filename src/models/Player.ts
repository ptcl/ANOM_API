import { ObjectId } from 'mongodb';

export interface Player {
    _id?: ObjectId;
    bungieId: string;
    displayName: string;
    membershipType: number;
    profilePicturePath?: string;
    role: 'player' | 'creator' | 'admin';

    // OAuth tokens
    bungieTokens?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };

    // Timestamps
    joinedAt: Date;
    lastActivity: Date;

    // Settings
    settings?: {
        notifications: boolean;
        publicProfile: boolean;
    };

}