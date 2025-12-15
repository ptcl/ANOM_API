export interface IEmblem {
    emblemId: string;
    name: string;
    description?: string;
    image?: string;
    code?: string;
    rarity?: "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY" | "EXOTIC";
    status: "AVAILABLE" | "UNAVAILABLE" | "REVOKED" | "REJECTED";
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}