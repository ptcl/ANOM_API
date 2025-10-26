import { Types, Document } from "mongoose";
import { IBadge } from "./badge";
import { IContract } from "./contract";

export interface IBungieToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface IDestinyMembership {
    crossSaveOverride?: number | null;
    applicableMembershipTypes?: number[];
    isPublic?: boolean | null;
    membershipType: number;
    membershipId: string;
    displayName?: string | null;
    bungieGlobalDisplayName?: string | null;
    bungieGlobalDisplayNameCode?: number | null;
}

export interface IBungieUser {
    membershipId: number;
    uniqueName: string;
    displayName: string;
    profilePicture: number;
    about: string;
    firstAccess: Date;
    lastAccess: Date;
    psnDisplayName?: string;
    showActivity: boolean;
    locale: string;
    localeInheritDefault: boolean;
    profilePicturePath?: string;
    profileThemeName: string;
    steamDisplayName?: string;
    twitchDisplayName?: string;
    cachedBungieGlobalDisplayName?: string;
    cachedBungieGlobalDisplayNameCode?: number;
}

export interface IAgentSettings {
    notifications: boolean;
    publicProfile: boolean;
    protocolOSTheme?: "DEFAULT" | "DARKNESS";
    protocolSounds?: boolean;
    language?: string;
}

export interface IAgentBadge {
    badgeId: Types.ObjectId | IBadge;
    obtainedAt: Date;
}

export interface IAgentStats {
    timelinesCompleted: number;
    challengesSolved: number;
    fragmentsCollected: number;
    loreUnlocked: number;
    lastRewardedAt?: Date;
}

export interface IAgentHistory {
    action: string;
    targetId?: string;
    timestamp: Date;
    success?: boolean;
    meta?: Record<string, any>;
}

export type AgentRole = "AGENT" | "ECHO" | "ORACLE" | "ARCHITECT" | "FOUNDER" | "EMISSARY";
export type AgentGroup = "PROTOCOL" | "AURORA" | "ZENITH";
export type AgentSpecies = "HUMAN" | "EXO" | "AWOKEN";

export interface IProtocolProfile {
    agentName: string;
    customName?: string;
    badges: IAgentBadge[];
    species: AgentSpecies;
    roles: AgentRole[];
    clearanceLevel: number;
    hasSeenRecruitment: boolean;
    protocolJoinedAt?: Date;
    group: AgentGroup;
    settings: IAgentSettings;
    stats: IAgentStats;
    history: IAgentHistory[];
}
export interface IAgentContractLink {
    contractMongoId: Types.ObjectId;
    contractId: string;
    createdAs: "DONOR";
    linkedAt: Date;
    statusSnapshot: "PENDING" | "VALIDATED" | "CANCELLED" | "REVOKED";
    lastSyncedAt: Date;
}

export interface IAgent {
    bungieId: string;
    bungieTokens?: IBungieToken;
    destinyMemberships?: IDestinyMembership[];
    bungieUser: IBungieUser;
    protocol: IProtocolProfile;
    contracts?: IAgentContractLink[];

    activeTimeline?: string;
    completedTimelines?: string[];

    isActive?: boolean;
    deactivatedAt?: Date;
    deactivatedBy?: string;
    deactivationReason?: string;
    reactivatedAt?: Date;
    reactivatedBy?: string;

    lastActivity?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}


export interface IAgentDocument extends IAgent, Document<Types.ObjectId> { }
export interface IAgentPopulated extends Omit<IAgent, "protocol"> {
    protocol: Omit<IProtocolProfile, "badges"> & {
        badges: Array<{
            badgeId: IBadge;
            obtainedAt: Date;
        }>;
    };
}
