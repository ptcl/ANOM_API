import { Document, Types } from "mongoose";

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface IBadge {
    badgeId: string;
    name: string;
    description?: string;
    rarity: BadgeRarity;
    icon?: string;
    obtainable: boolean;
    linkedTier?: number;
    linkedTimeline?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBadgeDocument extends IBadge, Document<Types.ObjectId> { }
