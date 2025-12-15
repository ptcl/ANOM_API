import { Types } from 'mongoose';

export type LoreCategory = 'HISTORY' | 'CHARACTER' | 'LOCATION' | 'EVENT' | 'ARTIFACT' | 'FACTION' | 'TECHNOLOGY' | 'OTHER';
export type LoreStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type LoreVisibility = 'PUBLIC' | 'AGENTS_ONLY' | 'UNLOCKED_ONLY';

export interface ILorePage {
    pageNumber: number;
    title?: string;
    content: string;
}

export interface ILoreUnlockConditions {
    requiredTimelineIds: string[];
    requiredEntryIds: string[];
    requiredLoreIds: string[];
    requiredFragments: number;
    manualUnlock: boolean;
}

export interface ILoreTracking {
    agentId: Types.ObjectId | string;
    unlockedAt?: Date;
    readAt?: Date;
    lastPageRead?: number;
}

export interface ILore {
    _id?: Types.ObjectId | string;
    loreId: string;
    title: string;
    summary?: string;
    pages: ILorePage[];
    totalPages: number;
    category: LoreCategory;
    tags: string[];
    parentLoreId?: string;
    relatedLoreIds: string[];
    isLocked: boolean;
    unlockConditions: ILoreUnlockConditions;
    coverImage?: string;
    audio?: string;
    externalLinks: string[];
    author?: string;
    status: LoreStatus;
    visibility: LoreVisibility;
    order: number;
    unlockedBy: ILoreTracking[];
    readBy: ILoreTracking[];
    createdAt: Date;
    updatedAt: Date;
}
