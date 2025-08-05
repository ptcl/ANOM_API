export interface BungieTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    membership_id: string;
    refresh_expires_in: number;
}

export interface BungieUserProfile {
    membershipId: string;
    membershipType: number;
    displayName: string;
    profilePicturePath?: string;
    about?: string;
    destinyMemberships?: DestinyMembership[];
    rawData?: any;
}

export interface DestinyMembership {
    membershipType: number;
    membershipId: string;
    displayName: string;
    crossSaveOverride?: number;
    applicableMembershipTypes?: number[];
    isPublic?: boolean;
    bungieGlobalDisplayName?: string;
    bungieGlobalDisplayNameCode?: number;
}

export interface BungieAPIResponse<T> {
    Response: T;
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: any;
}
export interface BungieCurrentUserResponse {
    destinyMemberships: DestinyMembership[];
    bungieNetUser: {
        membershipId: string;
        uniqueName: string;
        displayName: string;
        profilePicture: number;
        profileTheme: number;
        userTitle: number;
        successMessageFlags: string;
        isDeleted: boolean;
        about: string;
        firstAccess: string;
        lastUpdate: string;
        context: {
            isFollowing: boolean;
            ignoreStatus: {
                isIgnored: boolean;
                ignoreFlags: number;
            };
        };
        psnDisplayName?: string;
        showActivity: boolean;
        locale: string;
        localeInheritDefault: boolean;
        showGroupMessaging: boolean;
        profilePicturePath: string;
        profileThemeName: string;
        userTitleDisplay: string;
        statusText: string;
        statusDate: string;
        blizzardDisplayName?: string;
        steamDisplayName?: string;
        twitchDisplayName?: string;
        cachedBungieGlobalDisplayName: string;
        cachedBungieGlobalDisplayNameCode: number;
    };
    membershipOverrides?: {
        [key: string]: {
            membershipIdOverriding: string;
            membershipTypeOverriding: number;
            dateOverridden: string;
        };
    };
}