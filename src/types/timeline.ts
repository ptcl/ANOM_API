import { Document, Types } from "mongoose";

export interface ISecurityProtocol {
    clearanceLevel: "1" | "2" | "3" | "4" | "5";
    accessMode: "PUBLIC" | "RESTRICTED" | "CLASSIFIED";
    accessCode: string;
    requiresAuth: boolean;
    requires2FA: boolean;
    whiteList: string[];
    blackList: string[];
    autoLockOnBreach: boolean;
    maxAttempts: number;
    lockDuration: number;
    isCompromised: boolean;
    breachLogs: string[];
}

export interface IEditHistory {
    version: string;
    changes: string[];
    updatedBy: string;
    updatedAt: Date;
}

export interface IMetadata {
    createdBy?: string;
    collaborators: string[];
    ownerTeam: string;
    version: string;
    editHistory: IEditHistory[];
    visibility: "PUBLIC" | "PRIVATE";
    validatedBy?: string;
    validatedAt?: Date;
    isVerified: boolean;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStateFlags {
    isDraft: boolean;
    isDeleted: boolean;
    isOpen: boolean;
    isProgress: boolean;
    isArchived: boolean;
    isClosed: boolean;
    isStabilized: boolean;
}

export interface IExternalRefs {
    images: string[];
    videos: string[];
    documents: string[];
    links: string[];
}

export interface IActivityMetrics {
    totalAttempts: number;
    totalCompleted: number;
    avgCompletionTime: number;
    lastCompletedAt: Date;
    lastActivityAt: Date;
}

export interface IEntryDialogs {
    intro: string[];
    success: string[];
    failure: string[];
}

export interface IEntry {
    entryId: string;
    name: string;
    description?: string;
    type: "ENIGMA" | "FIREWALL" | "DATA_NODE";
    accessCode: string;
    solution?: string;
    linkedFragment: string[];
    linkedLore: string[];
    reward: "FRAGMENT" | "INDEX" | "NONE";
    status: "ACTIVE" | "LOCKED" | "SOLVED";
    dialogs: IEntryDialogs;
    grantKeys: string[];
    requiredKeys: string[];
    subEntries?: IEntry[];
}

export interface IParticipant {
    agentId: string;
    teamId?: string;
    progress: number;
    fragmentsFound: string[];
    fragmentsCollected: number;
    keysFound: string[];
    lastActivityAt: Date;
    completed: boolean;
}

export interface ITeam {
    teamId: string;
    name: string;
    description?: string;
    members: string[];
    progress: number;
    fragmentsFound: string[];
    fragmentsCollected: number;
}

export interface IStabilization {
    winnerType: "AGENT" | "TEAM";
    winnerAgentId?: string;
    winnerTeamId?: string;
    completedAt: Date;
}

export interface ITimelineReward {
    discordRoleId?: string;
    badge?: string;
    emblem: string[];
    archivesEntry: boolean;
    indexAccess: boolean;
    specialFragment: boolean;
    irlObject: boolean;
}

export interface ILoreLockRule {
    loreRefs: string[];
    loreUnlocked: string[];
    loreLockRules: string[];
}

export interface ITimelineLog {
    agentId?: string;
    teamId?: string;
    action?: string;
    entryId?: string;
    timestamp: Date;
    success: boolean;
}

export interface ITimelineCode {
    format: "AAA-BBB-CCC" | "AAA-BBB-CCC-DDD";
    pattern: any;
    targetCode: string[];
}

export interface ITimeline {
    _id?: Types.ObjectId | string;
    timelineId: string;
    name: string;
    description?: string;
    tier: 1 | 2 | 3 | 4 | 5;
    isShared: boolean;
    status: "DRAFT" | "DELETED" | "OPEN" | "PROGRESS" | "ARCHIVED" | "CLOSED" | "STABILIZED";

    code: ITimelineCode;
    emblemId: string[];

    metadata?: IMetadata;
    securityProtocol?: ISecurityProtocol;
    stateFlags?: IStateFlags;
    externalRefs?: IExternalRefs;
    activityMetrics?: IActivityMetrics;

    entries: IEntry[];
    participants: IParticipant[];
    teams: ITeam[];

    stabilizedAt?: IStabilization;
    rewards?: ITimelineReward;
    loreLockRules?: ILoreLockRule;
    logs?: ITimelineLog[];

    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITimelineDocument extends Omit<ITimeline, '_id'>, Document { }
