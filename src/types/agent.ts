import { Types, Document } from "mongoose";
import { IBadge } from "./badge";

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
    completedTimelines: number;
    fragmentsCollected: number;
    lastFragmentUnlockedAt?: Date;
    lastSyncAt?: Date;
}

export interface IAgentHistory {
    action: string;
    targetId?: string;
    timestamp: Date;
    success?: boolean;
    meta?: Record<string, any>;
}

export interface IAgentTimelineLocalization {
    currentTimelineId?: string | null;
    currentTimelineEntryId?: string | null;
    lastSyncedAt?: Date;
}

export type AgentRole = string;
export type AgentDivision = string;
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
    division: AgentDivision;
    settings: IAgentSettings;
    stats: IAgentStats;
    timelineLocalization?: IAgentTimelineLocalization;
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

export interface IAgentTimelineLink {
    timelineMongoId: Types.ObjectId;
    timelineId: string;
    title?: string;
    accessedAt: Date;
    lastUpdatedAt: Date;
    currentEntryId?: string;
    fragmentsFound: string[];
    fragmentsCollected: number;
    keysFound: string[];
    entriesResolved: string[];
    completed: boolean;
    completedAt?: Date;
}

export interface IAgent {
    _id?: Types.ObjectId | string;
    bungieId: string;
    bungieTokens?: IBungieToken;
    destinyMemberships?: IDestinyMembership[];
    bungieUser: IBungieUser;
    protocol: IProtocolProfile;

    contracts?: IAgentContractLink[];
    timelines?: IAgentTimelineLink[];

    lastActivity?: Date;

    isActive?: boolean;
    deactivatedAt?: Date;
    deactivatedBy?: string;
    deactivationReason?: string;
    reactivatedAt?: Date;
    reactivatedBy?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAgentDocument extends Omit<IAgent, '_id'>, Document<Types.ObjectId> { }

export interface IAgentPopulated extends Omit<IAgent, "protocol"> {
    protocol: Omit<IProtocolProfile, "badges"> & {
        badges: Array<{
            badgeId: IBadge;
            obtainedAt: Date;
        }>;
    };
}
